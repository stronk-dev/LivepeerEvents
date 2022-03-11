import mongoose from 'mongoose';

const TicketSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true
  },
  transactionHash: {
    type: String,
    required: true
  },
  transactionUrl: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  data: {
    type: Object,
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

const Ticket = mongoose.model('Ticket', TicketSchema);
export default Ticket;