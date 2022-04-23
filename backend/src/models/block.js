import mongoose from 'mongoose';

const BlockSchema = new mongoose.Schema({
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

const Block = mongoose.model('BlockSchema', BlockSchema);
export default Block;