import mongoose from 'mongoose';

const RewardEventSchema = new mongoose.Schema({
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
  },
  blockRound: {
    type: Number,
    required: false    
  }
}, { timestamps: false });

const RewardEvent = mongoose.model('RewardEvent', RewardEventSchema);
export default RewardEvent;