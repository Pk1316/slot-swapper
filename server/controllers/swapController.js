import asyncHandler from 'express-async-handler';
import Event from '../models/Events.js';
import SwapRequest from '../models/SwapRequest.js';
import { sendMail } from '../utils/mailer.js'; // Nodemailer utility

// Enum fallback (in case the model doesn’t define Status enums)
const EventStatus = Event.Status || {
  BUSY: 'BUSY',
  SWAPPABLE: 'SWAPPABLE',
  SWAP_PENDING: 'SWAP_PENDING',
};

const SwapStatus = SwapRequest.Status || {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
};

/**
 * @desc Get all swappable slots (not owned by current user)
 * @route GET /api/swap/swappable-slots
 */
const getSwappableSlots = asyncHandler(async (req, res) => {
  if (!req.user?._id) {
    return res.status(401).json({ message: 'Unauthorized - user missing' });
  }

  const slots = await Event.find({
    status: EventStatus.SWAPPABLE,
    owner: { $ne: req.user._id },
  }).populate('owner', 'name email');

  res.json(slots);
});

/**
 * @desc Create a new swap request
 * @route POST /api/swap/swap-request
 */
const createSwapRequest = asyncHandler(async (req, res) => {
  const { mySlotId, theirSlotId } = req.body;

  try {
    console.log('🟡 Incoming swap request:', { mySlotId, theirSlotId, user: req.user });

    if (!req.user?._id) {
      return res.status(401).json({ message: 'Unauthorized - missing user' });
    }

    const mySlot = await Event.findById(mySlotId);
    const theirSlot = await Event.findById(theirSlotId);

    if (!mySlot || !theirSlot) {
      console.warn('⚠️ Slot(s) not found', { mySlot, theirSlot });
      return res.status(404).json({ message: 'One or both slots not found' });
    }

    if (!mySlot.owner.equals(req.user._id)) {
      console.warn('⚠️ Unauthorized slot ownership:', {
        slotOwner: mySlot.owner,
        user: req.user._id,
      });
      return res.status(403).json({ message: 'You do not own this slot' });
    }

    if (
      mySlot.status !== EventStatus.SWAPPABLE ||
      theirSlot.status !== EventStatus.SWAPPABLE
    ) {
      console.warn('⚠️ Invalid slot status:', {
        mySlotStatus: mySlot.status,
        theirSlotStatus: theirSlot.status,
      });
      return res.status(400).json({ message: 'Both slots must be SWAPPABLE' });
    }

    if (!theirSlot.owner) {
      console.warn('⚠️ theirSlot has no owner:', theirSlot);
      return res.status(400).json({ message: 'Target slot missing owner' });
    }

    // Create swap request
    const swap = await SwapRequest.create({
      requester: req.user._id,
      responder: theirSlot.owner,
      mySlot: mySlot._id,
      theirSlot: theirSlot._id,
      status: SwapStatus.PENDING,
    });

    console.log('✅ Swap request created:', swap._id);

    // Lock both slots
    mySlot.status = EventStatus.SWAP_PENDING;
    theirSlot.status = EventStatus.SWAP_PENDING;
    await mySlot.save();
    await theirSlot.save();

    // Populate full data
    const created = await SwapRequest.findById(swap._id)
      .populate({
        path: 'mySlot',
        populate: { path: 'owner', select: 'name email' },
      })
      .populate({
        path: 'theirSlot',
        populate: { path: 'owner', select: 'name email' },
      })
      .populate('requester', 'name email')
      .populate('responder', 'name email');

    // SOCKET EMITS
    const io = req.app.get('io');
    if (io) {
      io.to(String(theirSlot.owner)).emit('swap:incoming', created);
      io.to(String(req.user._id)).emit('swap:outgoing', created);
    }

    // ✅ EMAIL notification to responder (User B)
    try {
      await sendMail(
        created.responder.email,
        '📅 New Swap Request on SlotSwapper',
        `Hey ${created.responder.name},\n\n${created.requester.name} has requested to swap their "${created.mySlot.title}" with your "${created.theirSlot.title}".\n\nLog in to SlotSwapper to accept or reject this request.`
      );
      console.log(` Swap request email sent to ${created.responder.email}`);
    } catch (e) {
      console.warn('Email notification failed:', e.message);
    }

    res.json(created);
  } catch (err) {
    console.error(' Error in createSwapRequest:', err.message, err.stack);
    res.status(500).json({ message: 'Server error creating swap', error: err.message });
  }
});

/**
 * @desc Respond to a swap request (accept/reject)
 * @route POST /api/swap/swap-response/:requestId
 */
const respondToSwap = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const { accept } = req.body;

  try {
    console.log(' Swap response:', { requestId, accept, user: req.user });

    const swap = await SwapRequest.findById(requestId)
      .populate('mySlot theirSlot requester responder');

    if (!swap) return res.status(404).json({ message: 'Swap request not found' });
    if (!swap.responder.equals(req.user._id))
      return res.status(403).json({ message: 'Not authorized to respond' });
    if (swap.status !== SwapStatus.PENDING)
      return res.status(400).json({ message: 'Swap already processed' });

    const mySlot = await Event.findById(swap.mySlot);
    const theirSlot = await Event.findById(swap.theirSlot);
    const io = req.app.get('io');

    //  Rejection branch
    if (!accept) {
      swap.status = SwapStatus.REJECTED;

      if (mySlot.status === EventStatus.SWAP_PENDING)
        mySlot.status = EventStatus.SWAPPABLE;
      if (theirSlot.status === EventStatus.SWAP_PENDING)
        theirSlot.status = EventStatus.SWAPPABLE;

      await swap.save();
      await mySlot.save();
      await theirSlot.save();

      const populated = await SwapRequest.findById(swap._id)
        .populate('mySlot theirSlot requester responder');

      // SOCKET EMITS
      if (io) {
        io.to(String(swap.requester)).emit('swap:updated', populated);
        io.to(String(swap.responder)).emit('swap:updated', populated);
      }

      //  EMAIL: notify requester about rejection
      try {
        await sendMail(
          populated.requester.email,
          ' Your Swap Request Was Rejected',
          `Hey ${populated.requester.name},\n\n${populated.responder.name} has rejected your swap request for "${populated.theirSlot.title}".\n\nYou can try swapping with another available slot on SlotSwapper.`
        );
        console.log(` Rejection email sent to ${populated.requester.email}`);
      } catch (e) {
        console.warn('Email notification failed:', e.message);
      }

      return res.json(populated);
    }

    //  Acceptance branch
    const tempOwner = mySlot.owner;
    mySlot.owner = theirSlot.owner;
    theirSlot.owner = tempOwner;
    mySlot.status = EventStatus.BUSY;
    theirSlot.status = EventStatus.BUSY;
    swap.status = SwapStatus.ACCEPTED;

    await mySlot.save();
    await theirSlot.save();
    await swap.save();

    const populated = await SwapRequest.findById(swap._id)
      .populate({
        path: 'mySlot',
        populate: { path: 'owner', select: 'name email' },
      })
      .populate({
        path: 'theirSlot',
        populate: { path: 'owner', select: 'name email' },
      })
      .populate('requester', 'name email')
      .populate('responder', 'name email');

    // SOCKET EMITS
    if (io) {
      io.to(String(swap.requester)).emit('swap:updated', populated);
      io.to(String(swap.responder)).emit('swap:updated', populated);
    }

    //  EMAIL: notify requester of acceptance
    try {
      await sendMail(
        populated.requester.email,
        ' Your Swap Request Was Accepted!',
        `Hey ${populated.requester.name},\n\n${populated.responder.name} accepted your swap request.\n\n"${populated.mySlot.title}" has been swapped with "${populated.theirSlot.title}".\n\nYou can check your updated calendar on SlotSwapper.`
      );
      console.log(` Acceptance email sent to ${populated.requester.email}`);
    } catch (e) {
      console.warn('Email notification failed:', e.message);
    }

    res.json(populated);
  } catch (err) {
    console.error(' Error in respondToSwap:', err.message, err.stack);
    res.status(500).json({ message: 'Server error responding to swap', error: err.message });
  }
});

/**
 * @desc Get my incoming/outgoing swap requests
 * @route GET /api/swap/my-requests
 */
const getIncomingOutgoing = asyncHandler(async (req, res) => {
  const incoming = await SwapRequest.find({ responder: req.user._id })
    .populate('mySlot theirSlot requester responder')
    .sort({ createdAt: -1 });

  const outgoing = await SwapRequest.find({ requester: req.user._id })
    .populate('mySlot theirSlot requester responder')
    .sort({ createdAt: -1 });

  res.json({ incoming, outgoing });
});

export default {
  getSwappableSlots,
  createSwapRequest,
  respondToSwap,
  getIncomingOutgoing,
};
