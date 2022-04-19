import mongoose from 'mongoose';

const UpdateEventSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true
  },
  rewardCommission: {
    type: Number,
    required: true
  },
  feeCommission: {
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

const UpdateEvent = mongoose.model('UpdateEvent', UpdateEventSchema);
export default UpdateEvent;