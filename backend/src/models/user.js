import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  ip: {
    type: String,
    required: true
  }
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
export default User;