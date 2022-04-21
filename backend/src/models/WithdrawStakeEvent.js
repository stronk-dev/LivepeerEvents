import mongoose from 'mongoose';

const WithdrawStakeEventSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true
  },
  round: {
    type: Number,
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

const WithdrawStakeEvent = mongoose.model('WithdrawStakeEvent', WithdrawStakeEventSchema);
export default WithdrawStakeEvent;