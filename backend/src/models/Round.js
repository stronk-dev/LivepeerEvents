import mongoose from 'mongoose';

const RoundSchema = new mongoose.Schema({
  number: {
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
  lengthBlocks: {
    type: Number,
    required: false
  },
  startBlock: {
    type: Number,
    required: false
  },
  endBlock: {
    type: Number,
    required: false
  },
  mintableTokens: {
    type: Number,
    required: false
  },
  volumeEth: {
    type: Number,
    required: false
  },
  volumeUsd: {
    type: Number,
    required: false
  },
  totalActiveStake: {
    type: Number,
    required: false
  },
  totalSupply: {
    type: Number,
    required: false
  },
  participationRate: {
    type: Number,
    required: false
  },
  movedStake: {
    type: Number,
    required: false
  },
  newStake: {
    type: Number,
    required: false
  }
}, { timestamps: false });

const Round = mongoose.model('Round', RoundSchema);
export default Round;