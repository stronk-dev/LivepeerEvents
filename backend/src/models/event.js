import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true
  },
  transactionHash: {
    type: String,
    required: true
  },
  transactionUrl: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  data: {
    type: Object,
    required: true
  },
  blockNumber: {
    type: Number,
    required: true
  },
  blockTime: {
    type: Number,
    required: true
  }
}, { timestamps: false });

const Event = mongoose.model('Event', EventSchema);
export default Event;