import mongoose from 'mongoose';

const WithdrawFeesEventSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true
  },
  amount: {
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

const WithdrawFeesEvent = mongoose.model('WithdrawFeesEvent', WithdrawFeesEventSchema);
export default WithdrawFeesEvent;