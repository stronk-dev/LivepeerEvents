import mongoose from 'mongoose';

const RoundSchema = new mongoose.Schema({
  number: {
    type: Number,
    required: true
  },
  lengthBlocks: {
    type: Number,
    required: true
  },
  startBlock: {
    type: Number,
    required: true
  },
  endBlock: {
    type: Number,
    required: true
  },
  mintableTokens: {
    type: Number,
    required: true
  },
  volumeEth: {
    type: Number,
    required: true
  },
  volumeUsd: {
    type: Number,
    required: true
  },
  totalActiveStake: {
    type: Number,
    required: true
  },
  totalSupply: {
    type: Number,
    required: true
  },
  participationRate: {
    type: Number,
    required: true
  },
  movedStake: {
    type: Number,
    required: true
  },
  newStake: {
    type: Number,
    required: true
  }
}, { timestamps: false });

const Round = mongoose.model('RoundSchema', RoundSchema);
export default Round;