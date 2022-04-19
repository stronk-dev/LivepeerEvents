import mongoose from 'mongoose';

const StakeEventSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true
  },
  from: {
    type: String,
    required: false
  },
  to: {
    type: String,
    required: false
  },
  stake: {
    type: Number,
    required: true
  },
  transactionHash: {
    type: String,
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

const StakeEvent = mongoose.model('StakeEvent', StakeEventSchema);
export default StakeEvent;