import mongoose from 'mongoose';

const timelapseSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.ObjectId,
    ref: 'User',
    required: true
  },
  OwnerIp: {
    type: String,
    required: true
  },
  fullFilename: {
    type: String,
    required: true
  },
  upvotes: {
    type: Number,
    required: false,
    default: 0
  },
  downvotes: {
    type: Number,
    required: false,
    default: 0
  }
}, { timestamps: true });


const timelapseObj = mongoose.model('timelapseSchema', timelapseSchema);
export default timelapseObj;