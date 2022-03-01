import mongoose from 'mongoose';


//database schema for users
const EventSchema = new mongoose.Schema({
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
}, { timestamps: true });

//define variable User, which corresponds with the schema
const Event = mongoose.model('Event', EventSchema);
//export for use outside of this file
export default Event;