import mongoose from 'mongoose';

const TransferEventSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true
  },
  to: {
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

const TransferEvent = mongoose.model('TransferEvent', TransferEventSchema);
export default TransferEvent;