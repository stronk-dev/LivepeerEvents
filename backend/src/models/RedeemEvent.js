import mongoose from 'mongoose';

const RedeemEventSchema = new mongoose.Schema({
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

const RedeemEvent = mongoose.model('RedeemEvent', RedeemEventSchema);
export default RedeemEvent;