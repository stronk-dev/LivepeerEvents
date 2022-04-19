import mongoose from 'mongoose';

const WithdrawEventSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true
  },
  from: {
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

const WithdrawEvent = mongoose.model('WithdrawEvent', WithdrawEventSchema);
export default WithdrawEvent;