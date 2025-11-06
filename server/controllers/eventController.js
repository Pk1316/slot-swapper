import asyncHandler from 'express-async-handler';
import Event from '../models/Events.js';

/**
 * @desc Get all events of the logged-in user
 * @route GET /api/events
 */
export const getMyEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({ owner: req.user._id }).sort({ startTime: 1 });
  res.json(events);
});

/**
 * @desc Create a new event
 * @route POST /api/events
 */
export const createEvent = asyncHandler(async (req, res) => {
  const { title, startTime, endTime, status } = req.body;
  const event = await Event.create({
    title,
    startTime,
    endTime,
    status: status || 'BUSY',
    owner: req.user._id,
  });
  res.status(201).json(event);
});

/**
 * @desc Update event (make swappable, etc.)
 * @route PATCH /api/events/:id
 */
export const updateEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const event = await Event.findById(id);
  if (!event) return res.status(404).json({ message: 'Event not found' });

  if (!event.owner.equals(req.user._id)) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  Object.assign(event, req.body);
  await event.save();
  res.json(event);
});

/**
 * @desc Delete an event
 * @route DELETE /api/events/:id
 */
export const deleteEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const event = await Event.findById(id);
  if (!event) return res.status(404).json({ message: 'Event not found' });

  if (!event.owner.equals(req.user._id)) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  await event.deleteOne();
  res.json({ message: 'Event deleted' });
});

export default { getMyEvents, createEvent, updateEvent, deleteEvent };
