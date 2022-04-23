import mongoose from 'mongoose';

const ActivateEventSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true
  },
  initialStake: {
    type: Number,
    required: false
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
  },
  blockRound: {
    type: Number,
    required: false    
  }
}, { timestamps: false });

const ActivateEvent = mongoose.model('ActivateEvent', ActivateEventSchema);
export default ActivateEvent;