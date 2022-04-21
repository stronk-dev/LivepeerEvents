import mongoose from 'mongoose';

const ClaimEventSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true
  },
  fees: {
    type: Number,
    required: true
  },
  rewards: {
    type: Number,
    required: true
  },
  startRound: {
    type: Number,
    required: true
  },
  endRound: {
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

const ClaimEvent = mongoose.model('ClaimEvent', ClaimEventSchema);
export default ClaimEvent;