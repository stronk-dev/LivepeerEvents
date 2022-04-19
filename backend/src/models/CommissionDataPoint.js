import mongoose from 'mongoose';

const CommissionDataPointSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true
  },
  feeCommission: {
    type: Number,
    required: true
  },
  rewardCommission: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Number,
    required: true
  }
}, { timestamps: false });

const CommissionDataPoint = mongoose.model('CommissionDataPoint', CommissionDataPointSchema);
export default CommissionDataPoint;