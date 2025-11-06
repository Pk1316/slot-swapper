import mongoose from "mongoose";

const EventStatus = {
  BUSY: 'BUSY',
  SWAPPABLE: 'SWAPPABLE',
  SWAP_PENDING: 'SWAP_PENDING'
};

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  status: { type: String, enum: Object.values(EventStatus), default: EventStatus.BUSY },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  meta: { type: Object }, 
}, { timestamps: true });

eventSchema.statics.Status = EventStatus;
export default mongoose.model('Event', eventSchema);