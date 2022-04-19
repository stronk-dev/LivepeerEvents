import mongoose from 'mongoose';

const TotalStakeDataPointSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true
  },
  totalStake: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Number,
    required: true
  }
}, { timestamps: false });

const TotalStakeDataPoint = mongoose.model('TotalStakeDataPoint', TotalStakeDataPointSchema);
export default TotalStakeDataPoint;