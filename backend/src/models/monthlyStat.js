import mongoose from 'mongoose';

const MonthlyStatSchema = new mongoose.Schema({
  // Static props
  year: {
    type: Number,
    required: true
  },
  month: {
    type: Number,
    required: true
  },
  // Counters based on Smart Contract Events
  // Any TranscoderUpdate event: commission rates are done with thegraph query of current data, no historical data
  // Any TranscoderActivated event
  reactivationCount: {
    type: Number,
    required: false,
    default: 0
  },
  // Bond -> TranscoderActivated event
  activationCount: {
    type: Number,
    required: false,
    default: 0
  },
  activationInitialSum: {
    type: Number,
    required: false,
    default: 0
  },
  // Lone Unbond event
  unbondCount: {
    type: Number,
    required: false,
    default: 0
  },
  unbondStakeSum: {
    type: Number,
    required: false,
    default: 0
  },
  // Any Reward event
  rewardCount: {
    type: Number,
    required: false,
    default: 0
  },
  rewardAmountSum: {
    type: Number,
    required: false,
    default: 0
  },
  // Any EarningsClaimed event
  claimCount: {
    type: Number,
    required: false,
    default: 0
  },
  claimRewardSum: {
    type: Number,
    required: false,
    default: 0
  },
  claimFeeSum: {
    type: Number,
    required: false,
    default: 0
  },
  // Any WithdrawStake event
  withdrawStakeCount: {
    type: Number,
    required: false,
    default: 0
  },
  withdrawStakeAmountSum: {
    type: Number,
    required: false,
    default: 0
  },
  // Any WithdrawFees event
  withdrawFeesCount: {
    type: Number,
    required: false,
    default: 0
  },
  withdrawFeesAmountSum: {
    type: Number,
    required: false,
    default: 0
  },
  // Lone Bond event
  bondCount: {
    type: Number,
    required: false,
    default: 0
  },
  bondStakeSum: {
    type: Number,
    required: false,
    default: 0
  },
  // Unbond->TransferBond->Rebond event
  moveStakeCount: {
    type: Number,
    required: false,
    default: 0
  },
  moveStakeSum: {
    type: Number,
    required: false,
    default: 0
  },
  // Any TransferTicket event
  winningTicketsReceivedCount: {
    type: Number,
    required: false,
    default: 0
  },
  winningTicketsReceivedSum: {
    type: Number,
    required: false,
    default: 0
  },
  winningTicketsReceived: {
    type: [Object],
    required: false,
    default: []
  },
  winningTicketsSent: {
    type: [Object],
    required: false,
    default: []
  },
  // Any RedeemTicket event
  winningTicketsRedeemedCount: {
    type: Number,
    required: false,
    default: 0
  },
  winningTicketsRedeemedSum: {
    type: Number,
    required: false,
    default: 0
  },
  winningTicketsRedeemed: {
    type: [Object],
    required: false,
    default: []
  },
  // Dynamic stats (until the month has passed) containing latest commission, latest totalStake
  orchestratorStats: {
    type: [Object],
    required: false,
    default: null
  },
  testScores: {
    type: Object,
    required: false,
    default: null
  },
}, { timestamps: false });

const MonthlyStat = mongoose.model('MonthlyStat', MonthlyStatSchema);
export default MonthlyStat;