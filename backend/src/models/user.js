import mongoose from 'mongoose';


//database schema for users
const UserSchema = new mongoose.Schema({
  ip: {
    type: String,
    required: true
  },
  upvotedTimelapses: {
    type: [mongoose.ObjectId],
    ref: 'timelapseSchema',
    required: false,
    default: []
  },
  downvotedTimelapses: {
    type: [mongoose.ObjectId],
    ref: 'timelapseSchema',
    required: false,
    default: []
  }
}, { timestamps: true });


//takes a database field as input, returns T/F if entry already exists.
//iterates through entire user DB, any field
UserSchema.statics.doesNotExist = async function (field) {
  return await this.where(field).countDocuments() === 0;
};

//define variable User, which corresponds with the schema
const User = mongoose.model('User', UserSchema);
//export for use outside of this file
export default User;
