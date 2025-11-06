import mongoose from 'mongoose';

const SwapStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED'
};

const swapRequestSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  responder: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mySlot: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  theirSlot: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  status: { type: String, enum: Object.values(SwapStatus), default: SwapStatus.PENDING },
  meta: { type: Object }
}, { timestamps: true });

swapRequestSchema.statics.Status = SwapStatus;

export default mongoose.model('SwapRequest', swapRequestSchema);
