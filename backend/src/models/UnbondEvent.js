import mongoose from 'mongoose';

const UnbondEventSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true
  },
  from: {
    type: String,
    required: true
  },
  stake: {
    type: Number,
    required: true
  },
  round: {
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

const UnbondEvent = mongoose.model('UnbondEvent', UnbondEventSchema);
export default UnbondEvent;