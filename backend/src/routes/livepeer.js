import express from "express";
import Event from '../models/event';
import Block from '../models/block';
import Ticket from '../models/ticketEvent';

import ActivateEvent from "../models/ActivateEvent";
import ClaimEvent from "../models/ClaimEvent";
import RedeemEvent from "../models/RedeemEvent";
import RewardEvent from "../models/RewardEvent";
import StakeEvent from "../models/StakeEvent";
import TransferEvent from "../models/TransferEvent";
import UnbondEvent from "../models/UnbondEvent";
import UpdateEvent from "../models/UpdateEvent";
import WithdrawFeesEvent from "../models/WithdrawFeesEvent";
import WithdrawStakeEvent from "../models/WithdrawStakeEvent";
import MonthlyStat from "../models/monthlyStat";
import CommissionDataPoint from "../models/CommissionDataPoint";
import TotalStakeDataPoint from "../models/TotalStakeDataPoint";

const apiRouter = express.Router();
import {
  API_CMC, API_L1_KEY, API_L2_KEY, API_L2_HTTP, API_L1_HTTP,
  CONF_DEFAULT_ORCH, CONF_SIMPLE_MODE, CONF_TIMEOUT_CMC,
  CONF_TIMEOUT_ALCHEMY, CONF_TIMEOUT_LIVEPEER,
  CONF_DISABLE_DB, CONF_DISABLE_CMC, CONF_TIMEOUT_ENS_DOMAIN,
  CONF_TIMEOUT_ENS_INFO
} from "../config";

/*

INIT
imported modules

*/

// Do API requests to other API's
const https = require('https');

// Read ABI files
const fs = require('fs');

// Used for the livepeer thegraph API
import { request, gql } from 'graphql-request';
import Round from "../models/Round";

// Gets ETH, LPT and other coin info
let CoinMarketCap = require('coinmarketcap-api');
let cmcClient = new CoinMarketCap(API_CMC);
let cmcEnabled = false;
if (!CONF_DISABLE_CMC) {
  if (API_CMC == "") {
    console.log("Please provide a CMC api key");
  } else {
    CoinMarketCap = require('coinmarketcap-api');
    cmcClient = new CoinMarketCap(API_CMC);
    cmcEnabled = true;
  }
} else {
  console.log("Running without CMC api");
}

// Gets blockchain data
const { ethers } = require("ethers");
import { Network, Alchemy } from 'alchemy-sdk';
console.log("Connecting to HTTP RPC's");
const web3layer1 = new Alchemy({apiKey: API_L1_KEY, network: Network.ETH_MAINNET});
const web3layer2 = new Alchemy({apiKey: API_L2_KEY, network: Network.ARB_MAINNET});

// Smart contract event stuff
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const deprWeb3main = createAlchemyWeb3(API_L1_HTTP + API_L1_KEY);
const deprWeb3 = createAlchemyWeb3(API_L2_HTTP + API_L2_KEY);
let BondingManagerTargetJson;
let BondingManagerTargetAbi;
let BondingManagerProxyAddr;
let bondingManagerContract;
let TicketBrokerTargetJson;
let TicketBrokerTargetAbi;
let TicketBrokerTargetAddr;
let ticketBrokerContract;
let RoundsManagerTargetJson;
let RoundsManagerTargetAbi;
let RoundsManagerTargetAddr;
let roundsManagerContract;
if (!CONF_SIMPLE_MODE) {
  console.log("Loading contracts for smart contract events");
  // Listen for events on the bonding manager contract
  BondingManagerTargetJson = fs.readFileSync('src/abi/BondingManagerTarget.json');
  BondingManagerTargetAbi = JSON.parse(BondingManagerTargetJson);
  BondingManagerProxyAddr = "0x35Bcf3c30594191d53231E4FF333E8A770453e40";
  bondingManagerContract = new deprWeb3.eth.Contract(BondingManagerTargetAbi.abi, BondingManagerProxyAddr);
  // Listen for events on the ticket broker contract
  TicketBrokerTargetJson = fs.readFileSync('src/abi/TicketBrokerTarget.json');
  TicketBrokerTargetAbi = JSON.parse(TicketBrokerTargetJson);
  TicketBrokerTargetAddr = "0xa8bB618B1520E284046F3dFc448851A1Ff26e41B";
  ticketBrokerContract = new deprWeb3.eth.Contract(TicketBrokerTargetAbi.abi, TicketBrokerTargetAddr);
  // Listen for events on the rounds manager contract
  RoundsManagerTargetJson = fs.readFileSync('src/abi/RoundsManagerTarget.json');
  RoundsManagerTargetAbi = JSON.parse(RoundsManagerTargetJson);
  RoundsManagerTargetAddr = "0xdd6f56DcC28D3F5f27084381fE8Df634985cc39f";
  roundsManagerContract = new deprWeb3.eth.Contract(RoundsManagerTargetAbi.abi, RoundsManagerTargetAddr);
}

/*

GLOBAL helper functions

*/

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/*

BLOCKCHAIN BLOCKS
Stored in mongoDB (block.js) and local cache
Contains a mapping of blockNumber -> blockTime
so that we can attach timestamps to events

Currently all blocks get loaded from the DB once
on server boot, so if it is not cached, we can
assume it is not in DB

*/

let blockCache = [];
const getBlock = async function (blockNumber) {
  // See if it is cached
  for (const thisBlock of blockCache) {
    if (thisBlock.number === blockNumber) {
      return thisBlock;
    }
  }
  // Else get it and cache it
  const thisBlock = await web3layer2.core.getBlock(blockNumber);
  console.log("Caching new block " + thisBlock.number + " mined at " + thisBlock.timestamp);

  const blockObj = {
    blockNumber: thisBlock.number,
    blockTime: thisBlock.timestamp
  };
  blockCache.push(blockObj);
  if (!CONF_DISABLE_DB) {
    const dbObj = new Block(blockObj);
    await dbObj.save();
  }
  return thisBlock;
}

/*

SMART CONTRACT EVENTS
(Almost) raw ticket data stored in mongoDB (event.js) and local cache
Parsed events stored in mongoDB as *Event.js and local cache
Summarized stats stored in mongoDB as monthlyStat.js and local cache

*/

let startedInitSync = false;
let isSyncing = false;
let isEventSyncing = false;
let isTicketSyncing = false;
let isRoundSyncing = false;

let eventsCache = [];
let latestBlockInChain = 0;
let latestL1Block = 0;
let lastBlockEvents = 0;
let lastBlockTickets = 0;
let lastBlockRounds = 0;
let ticketsCache = [];

let alreadyHasAnyRefresh = {};

let updateEventCache = [];
let alreadyHasUpdateRefresh = {};

let rewardEventCache = [];
let alreadyHasRewardRefresh = {};

let claimEventCache = [];
let alreadyHasClaimRefresh = {};

let withdrawStakeEventCache = [];
let alreadyHasWithdrawStakeRefresh = {};

let withdrawFeesEventCache = [];
let alreadyHasWithdrawFeesRefresh = {};

let transferTicketEventCache = [];
let alreadyHasTransferTicketRefresh = {};

let redeemTicketEventCache = [];
let winningTicketCache = [];
let alreadyHasRedeemTicketRefresh = {};

let activateEventCache = [];
let alreadyHasActivateRefresh = {};

let unbondEventCache = [];
let alreadyHasUnbondRefresh = {};

let stakeEventCache = [];
let alreadyHasStakeRefresh = {};

let monthlyStatCache = [];
let alreadyHasMonthlyStatRefresh = {};

let commissionDataPointCache = [];
let totalStakeDataPoint = [];

apiRouter.post("/getAllMonthlyStats", async (req, res) => {
  try {
    const { smartUpdate } = req.body;
    if (smartUpdate && req.session.user && req.session.user.ip) {
      if (alreadyHasMonthlyStatRefresh[req.session.user.ip]) {
        res.send({ noop: true });
        return;
      }
    }
    res.send(monthlyStatCache);
    if (req.session.user && req.session.user.ip) {
      alreadyHasMonthlyStatRefresh[req.session.user.ip] = true;
    }
  } catch (err) {
    res.status(400).send(err);
  }
});

apiRouter.get("/getAllCommissions", async (req, res) => {
  try {
    res.send(commissionDataPointCache);
  } catch (err) {
    res.status(400).send(err);
  }
});

apiRouter.get("/getAllTotalStakes", async (req, res) => {
  try {
    res.send(totalStakeDataPoint);
  } catch (err) {
    res.status(400).send(err);
  }
});

apiRouter.post("/getAllUpdateEvents", async (req, res) => {
  try {
    const { smartUpdate } = req.body;
    if (smartUpdate && req.session.user && req.session.user.ip) {
      if (alreadyHasUpdateRefresh[req.session.user.ip]) {
        res.send({ noop: true });
        return;
      }
    }
    if (req.session.user && req.session.user.ip) {
      alreadyHasAnyRefresh[req.session.user.ip] = true;
      alreadyHasUpdateRefresh[req.session.user.ip] = true;
    }
    res.send(updateEventCache);
  } catch (err) {
    res.status(400).send(err);
  }
});

apiRouter.post("/getAllRewardEvents", async (req, res) => {
  try {
    const { smartUpdate } = req.body;
    if (smartUpdate && req.session.user &&req.session.user.ip) {
      if (alreadyHasRewardRefresh[req.session.user.ip]) {
        res.send({ noop: true });
        return;
      }
    }
    if (req.session.user && req.session.user.ip) {
      alreadyHasAnyRefresh[req.session.user.ip] = true;
      alreadyHasRewardRefresh[req.session.user.ip] = true;
    }
    res.send(rewardEventCache);
  } catch (err) {
    res.status(400).send(err);
  }
});

apiRouter.post("/getAllClaimEvents", async (req, res) => {
  try {
    const { smartUpdate } = req.body;
    if (smartUpdate && req.session.user && req.session.user.ip) {
      if (alreadyHasClaimRefresh[req.session.user.ip]) {
        res.send({ noop: true });
        return;
      }
    }
    if (req.session.user && req.session.user.ip) {
      alreadyHasAnyRefresh[req.session.user.ip] = true;
      alreadyHasClaimRefresh[req.session.user.ip] = true;
    }
    res.send(claimEventCache);
  } catch (err) {
    res.status(400).send(err);
  }
});

apiRouter.post("/getAllWithdrawStakeEvents", async (req, res) => {
  try {
    const { smartUpdate } = req.body;
    if (smartUpdate && req.session.user && req.session.user.ip) {
      if (alreadyHasWithdrawStakeRefresh[req.session.user.ip]) {
        res.send({ noop: true });
        return;
      }
    }
    if (req.session.user && req.session.user.ip) {
      alreadyHasAnyRefresh[req.session.user.ip] = true;
      alreadyHasWithdrawStakeRefresh[req.session.user.ip] = true;
    }
    res.send(withdrawStakeEventCache);
  } catch (err) {
    res.status(400).send(err);
  }
});

apiRouter.post("/getAllWithdrawFeesEvents", async (req, res) => {
  try {
    const { smartUpdate } = req.body;
    if (smartUpdate && req.session.user && req.session.user.ip) {
      if (alreadyHasWithdrawFeesRefresh[req.session.user.ip]) {
        res.send({ noop: true });
        return;
      }
    }
    if (req.session.user && req.session.user.ip) {
      alreadyHasAnyRefresh[req.session.user.ip] = true;
      alreadyHasWithdrawFeesRefresh[req.session.user.ip] = true;
    }
    res.send(withdrawFeesEventCache);
  } catch (err) {
    res.status(400).send(err);
  }
});

apiRouter.post("/getAllTransferTicketEvents", async (req, res) => {
  try {
    const { smartUpdate } = req.body;
    if (smartUpdate && req.session.user && req.session.user.ip) {
      if (alreadyHasTransferTicketRefresh[req.session.user.ip]) {
        res.send({ noop: true });
        return;
      }
    }
    if (req.session.user && req.session.user.ip) {
      alreadyHasAnyRefresh[req.session.user.ip] = true;
      alreadyHasTransferTicketRefresh[req.session.user.ip] = true;
    }
    res.send(transferTicketEventCache);
  } catch (err) {
    res.status(400).send(err);
  }
});

apiRouter.post("/getAllRedeemTicketEvents", async (req, res) => {
  try {
    const { smartUpdate } = req.body;
    if (smartUpdate && req.session.user && req.session.user.ip) {
      if (alreadyHasRedeemTicketRefresh[req.session.user.ip]) {
        res.send({ noop: true });
        return;
      }
    }
    if (req.session.user && req.session.user.ip) {
      alreadyHasAnyRefresh[req.session.user.ip] = true;
      alreadyHasRedeemTicketRefresh[req.session.user.ip] = true;
    }
    res.send(redeemTicketEventCache);
  } catch (err) {
    res.status(400).send(err);
  }
});

apiRouter.get("/getAllWinningTickets", async (req, res) => {
  try {
    res.send(winningTicketCache);
  } catch (err) {
    res.status(400).send(err);
  }
});

apiRouter.post("/getAllActivateEvents", async (req, res) => {
  try {
    const { smartUpdate } = req.body;
    if (smartUpdate && req.session.user && req.session.user.ip) {
      if (alreadyHasActivateRefresh[req.session.user.ip]) {
        res.send({ noop: true });
        return;
      }
    }
    if (req.session.user && req.session.user.ip) {
      alreadyHasAnyRefresh[req.session.user.ip] = true;
      alreadyHasActivateRefresh[req.session.user.ip] = true;
    }
    res.send(activateEventCache);
  } catch (err) {
    res.status(400).send(err);
  }
});

apiRouter.post("/getAllUnbondEvents", async (req, res) => {
  try {
    const { smartUpdate } = req.body;
    if (smartUpdate && req.session.user && req.session.user.ip) {
      if (alreadyHasUnbondRefresh[req.session.user.ip]) {
        res.send({ noop: true });
        return;
      }
    }
    if (req.session.user && req.session.user.ip) {
      alreadyHasAnyRefresh[req.session.user.ip] = true;
      alreadyHasUnbondRefresh[req.session.user.ip] = true;
    }
    res.send(unbondEventCache);
  } catch (err) {
    res.status(400).send(err);
  }
});

apiRouter.post("/getAllStakeEvents", async (req, res) => {
  try {
    const { smartUpdate } = req.body;
    if (smartUpdate && req.session.user && req.session.user.ip) {
      if (alreadyHasStakeRefresh[req.session.user.ip]) {
        res.send({ noop: true });
        return;
      }
    }
    if (req.session.user && req.session.user.ip) {
      alreadyHasAnyRefresh[req.session.user.ip] = true;
      alreadyHasStakeRefresh[req.session.user.ip] = true;
    }
    res.send(stakeEventCache);
  } catch (err) {
    res.status(400).send(err);
  }
});

apiRouter.get("/hasAnyRefresh", async (req, res) => {
  try {
    if (req.session.user && req.session.user.ip) {
      console.log(req.session.user.ip + " is checking for new Events");
      if (alreadyHasAnyRefresh[req.session.user.ip]) {
        console.log(req.session.user.ip + " is still up to date");
        res.send({ requiresRefresh: false });
        return;
      } else {
        console.log(req.session.user.ip + " requires an update");
      }
    }
    res.send({ requiresRefresh: true });
  } catch (err) {
    res.status(400).send(err);
  }
});

/*

SMART CONTRACT EVENTS - MONTHLY STATS UPDATING

*/

const updateMonthlyReward = async function (blockTime, amount) {
  var dateObj = new Date(0);
  dateObj.setUTCSeconds(blockTime);
  // Determine year, month and name
  const thisMonth = dateObj.getMonth();
  const thisYear = dateObj.getFullYear();
  console.log("Updating monthly Reward stats for " + thisYear + "-" + thisMonth);
  if (!CONF_DISABLE_DB) {
    // Update DB entry
    const doc = await MonthlyStat.findOneAndUpdate({
      year: thisYear,
      month: thisMonth
    }, {
      $inc: {
        rewardCount: 1,
        rewardAmountSum: amount
      }
    }, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    });
  }
  // Update cached entry if it is cached
  let found = false;
  for (var idx = 0; idx < monthlyStatCache.length; idx++) {
    if (monthlyStatCache[idx].year == thisYear && monthlyStatCache[idx].month == thisMonth) {
      monthlyStatCache[idx].rewardCount += 1;
      monthlyStatCache[idx].rewardAmountSum += amount;
      found = true;
      break;
    }
  }
  if (!found) {
    const doc = await MonthlyStat.findOne({
      year: thisYear,
      month: thisMonth
    });
    monthlyStatCache.push(doc);
  }
}

const updateMonthlyClaim = async function (blockTime, fees, rewards) {
  var dateObj = new Date(0);
  dateObj.setUTCSeconds(blockTime);
  // Determine year, month and name
  const thisMonth = dateObj.getMonth();
  const thisYear = dateObj.getFullYear();
  console.log("Updating monthly Claim stats for " + thisYear + "-" + thisMonth);
  if (!CONF_DISABLE_DB) {
    // Update DB entry
    const doc = await MonthlyStat.findOneAndUpdate({
      year: thisYear,
      month: thisMonth
    }, {
      $inc: {
        claimCount: 1,
        claimRewardSum: rewards,
        claimFeeSum: fees
      }
    }, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    });
  }
  // Update cached entry if it is cached
  let found = false;
  for (var idx = 0; idx < monthlyStatCache.length; idx++) {
    if (monthlyStatCache[idx].year == thisYear && monthlyStatCache[idx].month == thisMonth) {
      monthlyStatCache[idx].claimCount += 1;
      monthlyStatCache[idx].claimRewardSum += rewards;
      monthlyStatCache[idx].claimFeeSum += fees;
      found = true;
      break;
    }
  }
  if (!found) {
    const doc = await MonthlyStat.findOne({
      year: thisYear,
      month: thisMonth
    });
    monthlyStatCache.push(doc);
  }
}

const updateMonthlyWithdrawStake = async function (blockTime, amount) {
  var dateObj = new Date(0);
  dateObj.setUTCSeconds(blockTime);
  // Determine year, month and name
  const thisMonth = dateObj.getMonth();
  const thisYear = dateObj.getFullYear();
  console.log("Updating monthly WithdrawStake stats for " + thisYear + "-" + thisMonth);
  if (!CONF_DISABLE_DB) {
    // Update DB entry
    const doc = await MonthlyStat.findOneAndUpdate({
      year: thisYear,
      month: thisMonth
    }, {
      $inc: {
        withdrawStakeCount: 1,
        withdrawStakeAmountSum: amount
      }
    }, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    });
  }
  // Update cached entry if it is cached
  let found = false;
  for (var idx = 0; idx < monthlyStatCache.length; idx++) {
    if (monthlyStatCache[idx].year == thisYear && monthlyStatCache[idx].month == thisMonth) {
      monthlyStatCache[idx].withdrawStakeCount += 1;
      monthlyStatCache[idx].withdrawStakeAmountSum += amount;
      found = true;
      break;
    }
  }
  if (!found) {
    const doc = await MonthlyStat.findOne({
      year: thisYear,
      month: thisMonth
    });
    monthlyStatCache.push(doc);
  }
}

const updateMonthlyWithdrawFees = async function (blockTime, amount) {
  var dateObj = new Date(0);
  dateObj.setUTCSeconds(blockTime);
  // Determine year, month and name
  const thisMonth = dateObj.getMonth();
  const thisYear = dateObj.getFullYear();
  console.log("Updating monthly WithdrawFees stats for " + thisYear + "-" + thisMonth);
  if (!CONF_DISABLE_DB) {
    // Update DB entry
    const doc = await MonthlyStat.findOneAndUpdate({
      year: thisYear,
      month: thisMonth
    }, {
      $inc: {
        withdrawFeesCount: 1,
        withdrawFeesAmountSum: amount
      }
    }, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    });
  }
  // Update cached entry if it is cached
  let found = false;
  for (var idx = 0; idx < monthlyStatCache.length; idx++) {
    if (monthlyStatCache[idx].year == thisYear && monthlyStatCache[idx].month == thisMonth) {
      monthlyStatCache[idx].withdrawFeesCount += 1;
      monthlyStatCache[idx].withdrawFeesAmountSum += amount;
      found = true;
      break;
    }
  }
  if (!found) {
    const doc = await MonthlyStat.findOne({
      year: thisYear,
      month: thisMonth
    });
    monthlyStatCache.push(doc);
  }
}

const updateMonthlyNewDelegator = async function (blockTime, amount) {
  var dateObj = new Date(0);
  dateObj.setUTCSeconds(blockTime);
  // Determine year, month and name
  const thisMonth = dateObj.getMonth();
  const thisYear = dateObj.getFullYear();
  console.log("Updating monthly new Delegator stats for " + thisYear + "-" + thisMonth);
  if (!CONF_DISABLE_DB) {
    // Update DB entry
    const doc = await MonthlyStat.findOneAndUpdate({
      year: thisYear,
      month: thisMonth
    }, {
      $inc: {
        bondCount: 1,
        bondStakeSum: amount
      }
    }, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    });
  }
  // Update cached entry if it is cached
  let found = false;
  for (var idx = 0; idx < monthlyStatCache.length; idx++) {
    if (monthlyStatCache[idx].year == thisYear && monthlyStatCache[idx].month == thisMonth) {
      monthlyStatCache[idx].bondCount += 1;
      monthlyStatCache[idx].bondStakeSum += amount;
      found = true;
      break;
    }
  }
  if (!found) {
    const doc = await MonthlyStat.findOne({
      year: thisYear,
      month: thisMonth
    });
    monthlyStatCache.push(doc);
  }
}

const updateMonthlyUnbond = async function (blockTime, amount) {
  var dateObj = new Date(0);
  dateObj.setUTCSeconds(blockTime);
  // Determine year, month and name
  const thisMonth = dateObj.getMonth();
  const thisYear = dateObj.getFullYear();
  console.log("Updating monthly new Unbond stats for " + thisYear + "-" + thisMonth);
  if (!CONF_DISABLE_DB) {
    // Update DB entry
    const doc = await MonthlyStat.findOneAndUpdate({
      year: thisYear,
      month: thisMonth
    }, {
      $inc: {
        unbondCount: 1,
        unbondStakeSum: amount
      }
    }, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    });
  }
  // Update cached entry if it is cached
  let found = false;
  for (var idx = 0; idx < monthlyStatCache.length; idx++) {
    if (monthlyStatCache[idx].year == thisYear && monthlyStatCache[idx].month == thisMonth) {
      monthlyStatCache[idx].unbondCount += 1;
      monthlyStatCache[idx].unbondStakeSum += amount;
      found = true;
      break;
    }
  }
  if (!found) {
    const doc = await MonthlyStat.findOne({
      year: thisYear,
      month: thisMonth
    });
    monthlyStatCache.push(doc);
  }
}

const updateMonthlyReactivated = async function (blockTime, amount) {
  var dateObj = new Date(0);
  dateObj.setUTCSeconds(blockTime);
  // Determine year, month and name
  const thisMonth = dateObj.getMonth() + 1;
  const thisYear = dateObj.getFullYear();
  console.log("Updating monthly new reactivation stats for " + thisYear + "-" + thisMonth);
  if (!CONF_DISABLE_DB) {
    // Update DB entry
    const doc = await MonthlyStat.findOneAndUpdate({
      year: thisYear,
      month: thisMonth
    }, {
      $inc: {
        reactivationCount: 1
      }
    }, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    });
  }
  // Update cached entry if it is cached
  let found = false;
  for (var idx = 0; idx < monthlyStatCache.length; idx++) {
    if (monthlyStatCache[idx].year == thisYear && monthlyStatCache[idx].month == thisMonth) {
      monthlyStatCache[idx].reactivationCount += 1;
      found = true;
      break;
    }
  }
  if (!found) {
    const doc = await MonthlyStat.findOne({
      year: thisYear,
      month: thisMonth
    });
    monthlyStatCache.push(doc);
  }
}

const updateMonthlyActivation = async function (blockTime, amount) {
  var dateObj = new Date(0);
  dateObj.setUTCSeconds(blockTime);
  // Determine year, month and name
  const thisMonth = dateObj.getMonth();
  const thisYear = dateObj.getFullYear();
  console.log("Updating monthly new activation stats for " + thisYear + "-" + thisMonth);
  if (!CONF_DISABLE_DB) {
    // Update DB entry
    const doc = await MonthlyStat.findOneAndUpdate({
      year: thisYear,
      month: thisMonth
    }, {
      $inc: {
        activationCount: 1,
        activationInitialSum: amount
      }
    }, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    });
  }
  // Update cached entry if it is cached
  let found = false;
  for (var idx = 0; idx < monthlyStatCache.length; idx++) {
    if (monthlyStatCache[idx].year == thisYear && monthlyStatCache[idx].month == thisMonth) {
      monthlyStatCache[idx].activationCount += 1;
      monthlyStatCache[idx].activationInitialSum += amount;
      found = true;
      break;
    }
  }
  if (!found) {
    const doc = await MonthlyStat.findOne({
      year: thisYear,
      month: thisMonth
    });
    monthlyStatCache.push(doc);
  }
}

const updateMonthlyMoveStake = async function (blockTime, amount) {
  var dateObj = new Date(0);
  dateObj.setUTCSeconds(blockTime);
  // Determine year, month and name
  const thisMonth = dateObj.getMonth();
  const thisYear = dateObj.getFullYear();
  console.log("Updating monthly stake movement stats for " + thisYear + "-" + thisMonth);
  if (!CONF_DISABLE_DB) {
    // Update DB entry
    const doc = await MonthlyStat.findOneAndUpdate({
      year: thisYear,
      month: thisMonth
    }, {
      $inc: {
        moveStakeCount: 1,
        moveStakeSum: amount
      }
    }, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    });
  }
  // Update cached entry if it is cached
  let found = false;
  for (var idx = 0; idx < monthlyStatCache.length; idx++) {
    if (monthlyStatCache[idx].year == thisYear && monthlyStatCache[idx].month == thisMonth) {
      monthlyStatCache[idx].moveStakeCount += 1;
      monthlyStatCache[idx].moveStakeSum += amount;
      found = true;
      break;
    }
  }
  if (!found) {
    const doc = await MonthlyStat.findOne({
      year: thisYear,
      month: thisMonth
    });
    monthlyStatCache.push(doc);
  }
}

const updateMonthlyTicketReceived = async function (blockTime, amount, from, to) {
  var dateObj = new Date(0);
  dateObj.setUTCSeconds(blockTime);
  // Determine year, month and name
  const thisMonth = dateObj.getMonth();
  const thisYear = dateObj.getFullYear();
  console.log("Updating monthly ticket received stats for " + thisYear + "-" + thisMonth);
  if (!CONF_DISABLE_DB) {
    // Update DB entry
    const doc = await MonthlyStat.findOneAndUpdate({
      year: thisYear,
      month: thisMonth
    }, {
      $inc: {
        winningTicketsReceivedCount: 1,
        winningTicketsReceivedSum: amount
      }
    }, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    });
    // Check to see if the doc's embedded winningTicketsReceived already contains this address
    let hasModified = false;
    for (const eventObj of doc.winningTicketsReceived) {
      // If so, update that entry in winningTicketsReceived
      if (eventObj.address == to) {
        await MonthlyStat.updateOne({
          year: thisYear,
          month: thisMonth,
          'winningTicketsReceived.address': to
        }, {
          $set: {
            'winningTicketsReceived.$.sum': amount + eventObj.sum,
            'winningTicketsReceived.$.count': 1 + eventObj.count,
          }
        }, {
          new: true
        });
        hasModified = true;
        break;
      }
    }
    // Else push new data to winningTicketsReceived
    if (!hasModified) {
      await MonthlyStat.updateOne({
        year: thisYear,
        month: thisMonth,
        'winningTicketsReceived.address': { '$ne': to }
      }, {
        $push: {
          'winningTicketsReceived': {
            address: to,
            sum: amount,
            count: 1
          }
        }
      }, {
        new: true
      });
    }
    // Check to see if the doc's embedded winningTicketsSent already contains this address
    hasModified = false;
    for (var eventObj of doc.winningTicketsSent) {
      // If so, update that entry in winningTicketsSent
      if (eventObj.address == from) {
        await MonthlyStat.updateOne({
          year: thisYear,
          month: thisMonth,
          'winningTicketsSent.address': from
        }, {
          $set: {
            'winningTicketsSent.$.sum': amount + eventObj.sum,
            'winningTicketsSent.$.count': 1 + eventObj.count,
          }
        }, {
          new: true
        });
        hasModified = true;
        break;
      }
    }
    // Else push new data to winningTicketsSent
    if (!hasModified) {
      await MonthlyStat.updateOne({
        year: thisYear,
        month: thisMonth,
        'winningTicketsSent.address': { '$ne': from }
      }, {
        $push: {
          'winningTicketsSent': {
            address: from,
            sum: amount,
            count: 1
          }
        }
      }, {
        new: true
      });
    }
  }
  // Update cached entry if it is cached
  let found = false;
  for (var idx = 0; idx < monthlyStatCache.length; idx++) {
    if (monthlyStatCache[idx].year == thisYear && monthlyStatCache[idx].month == thisMonth) {
      monthlyStatCache[idx].winningTicketsReceivedCount += 1;
      monthlyStatCache[idx].winningTicketsReceivedSum += amount;
      let foundNested = false;
      // Check to see if the doc's embedded winningTicketsReceived already contains this address
      for (var idx2 = 0; idx2 < monthlyStatCache[idx].winningTicketsReceived.length; idx2++) {
        if (monthlyStatCache[idx].winningTicketsReceived[idx2].address == to) {
          monthlyStatCache[idx].winningTicketsReceived[idx2].count += 1;
          monthlyStatCache[idx].winningTicketsReceived[idx2].sum += amount;
          foundNested = true;
          break;
        }
      }
      if (!foundNested) {
        monthlyStatCache[idx].winningTicketsReceived.push({
          address: to,
          sum: amount,
          count: 1
        });
      }
      foundNested = false;
      // Check to see if the doc's embedded winningTicketsSent already contains this address
      for (var idx2 = 0; idx2 < monthlyStatCache[idx].winningTicketsSent.length; idx2++) {
        if (monthlyStatCache[idx].winningTicketsSent[idx2].address == from) {
          monthlyStatCache[idx].winningTicketsSent[idx2].count += 1;
          monthlyStatCache[idx].winningTicketsSent[idx2].sum += amount;
          foundNested = true;
          break;
        }
      }
      if (!foundNested) {
        monthlyStatCache[idx].winningTicketsSent.push({
          address: from,
          sum: amount,
          count: 1
        });
      }
      found = true;
      break;
    }
  }
  if (!found) {
    const doc = await MonthlyStat.findOne({
      year: thisYear,
      month: thisMonth
    });
    monthlyStatCache.push(doc);
  }
}

const updateMonthlyTicketRedeemed = async function (blockTime, amount, address) {
  var dateObj = new Date(0);
  dateObj.setUTCSeconds(blockTime);
  // Determine year, month and name
  const thisMonth = dateObj.getMonth();
  const thisYear = dateObj.getFullYear();
  console.log("Updating monthly ticket redeemed stats for " + thisYear + "-" + thisMonth);
  if (!CONF_DISABLE_DB) {
    // Update DB entry
    const doc = await MonthlyStat.findOneAndUpdate({
      year: thisYear,
      month: thisMonth
    }, {
      $inc: {
        winningTicketsRedeemedCount: 1,
        winningTicketsRedeemedSum: amount
      }
    }, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    });
    // Check to see if the doc's embedded winningTicketsRedeemed already contains this address
    let hasModified = false;
    for (const eventObj of doc.winningTicketsRedeemed) {
      // If so, update that entry in winningTicketsReceived
      if (eventObj.address == address) {
        await MonthlyStat.updateOne({
          year: thisYear,
          month: thisMonth,
          'winningTicketsRedeemed.address': address
        }, {
          $set: {
            'winningTicketsRedeemed.$.sum': amount + eventObj.sum,
            'winningTicketsRedeemed.$.count': 1 + eventObj.count,
          }
        }, {
          new: true
        });
        hasModified = true;
        break;
      }
    }
    // Else push new data to winningTicketsReceived
    if (!hasModified) {
      await MonthlyStat.updateOne({
        year: thisYear,
        month: thisMonth,
        'winningTicketsRedeemed.address': { '$ne': address }
      }, {
        $push: {
          'winningTicketsRedeemed': {
            address: address,
            sum: amount,
            count: 1
          }
        }
      }, {
        new: true
      });
    }
  }
  // Update cached entry if it is cached
  let found = false;
  for (var idx = 0; idx < monthlyStatCache.length; idx++) {
    if (monthlyStatCache[idx].year == thisYear && monthlyStatCache[idx].month == thisMonth) {
      monthlyStatCache[idx].winningTicketsRedeemedCount += 1;
      monthlyStatCache[idx].winningTicketsRedeemedSum += amount;
      let foundNested = false;
      // Check to see if the doc's embedded winningTicketsRedeemed already contains this address
      for (var idx2 = 0; idx2 < monthlyStatCache[idx].winningTicketsRedeemed.length; idx2++) {
        if (monthlyStatCache[idx].winningTicketsRedeemed[idx2].address == address) {
          monthlyStatCache[idx].winningTicketsRedeemed[idx2].count += 1;
          monthlyStatCache[idx].winningTicketsRedeemed[idx2].sum += amount;
          foundNested = true;
          break;
        }
      }
      if (!foundNested) {
        monthlyStatCache[idx].winningTicketsRedeemed.push({
          address: address,
          sum: amount,
          count: 1
        });
      }
      found = true;
      break;
    }
  }
  if (!found) {
    const doc = await MonthlyStat.findOne({
      year: thisYear,
      month: thisMonth
    });
    monthlyStatCache.push(doc);
  }
}

/*

SMART CONTRACT EVENTS - RAW EVENT PARSING

*/

// Parse any raw event into mongoDB object
const parseAnyEvent = async function (thisEvent) {
  const thisName = thisEvent.name;
  console.log('Parsing any event of name ' + thisName);
  if (thisName === "TranscoderUpdate") {
    const eventObj = {
      address: thisEvent.data.transcoder.toLowerCase(),
      rewardCommission: parseFloat(thisEvent.data.rewardCut) / 10000,
      feeCommission: 100 - (thisEvent.data.feeShare / 10000),
      transactionHash: thisEvent.transactionHash,
      blockNumber: thisEvent.blockNumber,
      blockTime: thisEvent.blockTime
    }
    if (!CONF_DISABLE_DB) {
      const dbObj = new UpdateEvent(eventObj);
      await dbObj.save();
    }
    // No monthly stats
    updateEventCache.push(eventObj);
    alreadyHasAnyRefresh = {};
    alreadyHasUpdateRefresh = {};
  } else if (thisName === "Reward") {
    const eventObj = {
      address: thisEvent.data.transcoder.toLowerCase(),
      amount: parseFloat(thisEvent.data.amount) / 1000000000000000000,
      transactionHash: thisEvent.transactionHash,
      blockNumber: thisEvent.blockNumber,
      blockTime: thisEvent.blockTime
    }
    if (!CONF_DISABLE_DB) {
      const dbObj = new RewardEvent(eventObj);
      await dbObj.save();
    }
    updateMonthlyReward(eventObj.blockTime, eventObj.amount);
    alreadyHasMonthlyStatRefresh = {};
    rewardEventCache.push(eventObj);
    alreadyHasAnyRefresh = {};
    alreadyHasRewardRefresh = {};
  } else if (thisName === "EarningsClaimed") {
    const eventObj = {
      address: thisEvent.data.delegator.toLowerCase(),
      fees: parseFloat(thisEvent.data.fees) / 1000000000000000000,
      rewards: parseFloat(thisEvent.data.rewards) / 1000000000000000000,
      startRound: parseInt(thisEvent.data.startRound),
      endRound: parseInt(thisEvent.data.endRound),
      transactionHash: thisEvent.transactionHash,
      blockNumber: thisEvent.blockNumber,
      blockTime: thisEvent.blockTime
    }
    if (!CONF_DISABLE_DB) {
      const dbObj = new ClaimEvent(eventObj);
      await dbObj.save();
    }
    updateMonthlyClaim(eventObj.blockTime, eventObj.fees, eventObj.rewards);
    alreadyHasMonthlyStatRefresh = {};
    claimEventCache.push(eventObj);
    alreadyHasAnyRefresh = {};
    alreadyHasClaimRefresh = {};
  } else if (thisName === "WithdrawStake") {
    const eventObj = {
      address: thisEvent.data.delegator.toLowerCase(),
      round: thisEvent.data.withdrawRound,
      amount: parseFloat(thisEvent.data.amount) / 1000000000000000000,
      transactionHash: thisEvent.transactionHash,
      blockNumber: thisEvent.blockNumber,
      blockTime: thisEvent.blockTime
    }
    if (!CONF_DISABLE_DB) {
      const dbObj = new WithdrawStakeEvent(eventObj);
      await dbObj.save();
    }
    updateMonthlyWithdrawStake(eventObj.blockTime, eventObj.amount);
    alreadyHasMonthlyStatRefresh = {};
    withdrawStakeEventCache.push(eventObj);
    alreadyHasAnyRefresh = {};
    alreadyHasWithdrawStakeRefresh = {};
  } else if (thisName === "WithdrawFees") {
    const eventObj = {
      address: thisEvent.data.delegator.toLowerCase(),
      amount: parseFloat(thisEvent.data.amount) / 1000000000000000000,
      transactionHash: thisEvent.transactionHash,
      blockNumber: thisEvent.blockNumber,
      blockTime: thisEvent.blockTime
    }
    if (!CONF_DISABLE_DB) {
      const dbObj = new WithdrawFeesEvent(eventObj);
      await dbObj.save();
    }
    updateMonthlyWithdrawFees(eventObj.blockTime, eventObj.amount);
    alreadyHasMonthlyStatRefresh = {};
    withdrawFeesEventCache.push(eventObj);
    alreadyHasAnyRefresh = {};
    alreadyHasWithdrawFeesRefresh = {};
  } else if (thisName === "WinningTicketTransfer") {
    const eventObj = {
      address: thisEvent.data.sender.toLowerCase(),
      to: thisEvent.data.recipient.toLowerCase(),
      amount: parseFloat(thisEvent.data.amount) / 1000000000000000000,
      transactionHash: thisEvent.transactionHash,
      blockNumber: thisEvent.blockNumber,
      blockTime: thisEvent.blockTime
    }
    if (!CONF_DISABLE_DB) {
      const dbObj = new TransferEvent(eventObj);
      await dbObj.save();
    }
    updateMonthlyTicketReceived(eventObj.blockTime, eventObj.amount, eventObj.address, eventObj.to);
    alreadyHasMonthlyStatRefresh = {};
    transferTicketEventCache.push(eventObj);
    alreadyHasAnyRefresh = {};
    alreadyHasTransferTicketRefresh = {};
  } else if (thisName === "WinningTicketRedeemed") {
    const eventObj = {
      address: thisEvent.data.recipient.toLowerCase(),
      amount: parseFloat(thisEvent.data.faceValue) / 1000000000000000000,
      transactionHash: thisEvent.transactionHash,
      blockNumber: thisEvent.blockNumber,
      blockTime: thisEvent.blockTime
    }
    if (!CONF_DISABLE_DB) {
      const dbObj = new RedeemEvent(eventObj);
      await dbObj.save();
    }
    updateMonthlyTicketRedeemed(eventObj.blockTime, eventObj.amount, eventObj.address);
    alreadyHasMonthlyStatRefresh = {};
    redeemTicketEventCache.push(eventObj);
    winningTicketCache.push({
      address: eventObj.address,
      amount: eventObj.amount,
      transactionHash: eventObj.transactionHash,
      blockNumber: eventObj.blockNumber,
      blockTime: eventObj.blockTime * 1000
    });
    alreadyHasAnyRefresh = {};
    alreadyHasRedeemTicketRefresh = {};
  } else {
    console.log("Skipping unknown event of type " + thisName);
  }
}

// Parse [Bond, Rebond, Unbond, TransferBond, TranscoderActivated] raw events into mongoDB object
let lastTx = "";
let lastTxTime = 0;
let parseCache = [];

const parseSequenceEvent = async function () {
  let eventCaller = "";           // address we will display on the left side
  let eventFrom = "";             // address from which X gets taken
  let eventTo = "";               // address to which X gets sent
  let eventAmount = 0;
  let eventWhen = "";
  let currentTx = "";
  let currentBlock = 0;
  let currentTime = 0;
  let eventContainsBond = false;
  let eventContainsTranscoderActivated = false;
  let eventContainsUnbond = false;
  let eventContainsRebond = false;
  let eventContainsTransferBond = false;
  // Temp vars for the current Event we are processing
  console.log('Parsing sequence of events');
  // Copy cache in case new events come in while we are still parsing this set of events
  const eventSequence = parseCache.slice();
  parseCache = [];
  // Go through each event and merge their data
  for (const eventObj of eventSequence) {
    if (currentTx === "") {
      currentTx = eventObj.transactionHash;
      currentBlock = eventObj.blockNumber;
      currentTime = eventObj.blockTime;
    }
    const thisName = eventObj.name;
    if (thisName === "Unbond") {
      eventContainsUnbond = true;
      eventCaller = eventObj.data.delegator.toLowerCase();
      eventFrom = eventObj.data.delegate.toLowerCase();
      eventAmount = parseFloat(eventObj.data.amount) / 1000000000000000000;
      eventWhen = eventObj.data.withdrawRound;
    } else if (thisName === "Bond") {
      eventContainsBond = true;
      eventCaller = eventObj.data.delegator.toLowerCase();
      eventFrom = eventObj.data.oldDelegate.toLowerCase();
      eventTo = eventObj.data.newDelegate.toLowerCase();
      eventAmount = parseFloat(eventObj.data.bondedAmount) / 1000000000000000000;
      // ignore eventObj.data.additionalAmount
    } else if (thisName === "Rebond") {
      eventContainsRebond = true;
      eventCaller = eventObj.data.delegator.toLowerCase();
      eventTo = eventObj.data.delegate.toLowerCase();
      eventAmount = parseFloat(eventObj.data.amount) / 1000000000000000000;
    } else if (thisName === "TransferBond") {
      eventContainsTransferBond = true;
      // Only set the from and to fields, if it wasn't set by other events in this TX
      if (!eventContainsUnbond) {
        eventFrom = eventObj.data.oldDelegator.toLowerCase();
      }
      if (!eventContainsRebond) {
        eventTo = eventObj.data.newDelegator.toLowerCase();
      }
      eventAmount = parseFloat(eventObj.data.amount) / 1000000000000000000;
    } else if (thisName === "TranscoderActivated") {
      eventContainsTranscoderActivated = true;
      eventCaller = eventObj.data.transcoder.toLowerCase();
      eventWhen = eventObj.data.activationRound;
    } else {
      console.log("Skipping unknown event of type " + thisName);
    }
  }

  if (eventContainsUnbond && eventContainsTransferBond && eventContainsRebond) {
    console.log('Parsing move stake sequence event');
    // Unbond -> TransferBond -> (eventContainsEarningsClaimed) -> Rebond: delegator moved stake
    const eventObj = {
      address: eventCaller,
      from: eventFrom,
      to: eventTo,
      stake: eventAmount,
      transactionHash: currentTx,
      blockNumber: currentBlock,
      blockTime: currentTime
    }
    if (!CONF_DISABLE_DB) {
      const dbObj = new StakeEvent(eventObj);
      await dbObj.save();
    }
    updateMonthlyMoveStake(eventObj.blockTime, eventObj.stake);
    alreadyHasMonthlyStatRefresh = {};
    stakeEventCache.push(eventObj);
    alreadyHasAnyRefresh = {};
    alreadyHasStakeRefresh = {};
  } else if (eventContainsBond && eventContainsTranscoderActivated) {
    console.log('Parsing TranscoderActivated sequence event');
    // Bond -> TranscoderActivated: activation in Round #
    const eventObj = {
      address: eventCaller,
      initialStake: eventAmount,
      round: eventWhen,
      transactionHash: currentTx,
      blockNumber: currentBlock,
      blockTime: currentTime
    }
    if (!CONF_DISABLE_DB) {
      const dbObj = new ActivateEvent(eventObj);
      await dbObj.save();
    }
    updateMonthlyActivation(eventObj.blockTime, eventObj.initialStake);
    alreadyHasMonthlyStatRefresh = {};
    activateEventCache.push(eventObj);
    alreadyHasAnyRefresh = {};
    alreadyHasActivateRefresh = {};
  } else if (eventContainsTranscoderActivated) {
    console.log('Parsing lone TranscoderActivated sequence event');
    // Lone TranscoderActivated: reactivation
    const eventObj = {
      address: eventCaller,
      round: eventWhen,
      transactionHash: currentTx,
      blockNumber: currentBlock,
      blockTime: currentTime
    }
    if (!CONF_DISABLE_DB) {
      const dbObj = new ActivateEvent(eventObj);
      await dbObj.save();
    }
    updateMonthlyReactivated(eventObj.blockTime);
    alreadyHasMonthlyStatRefresh = {};
    activateEventCache.push(eventObj);
    alreadyHasAnyRefresh = {};
    alreadyHasActivateRefresh = {};
  } else if (eventContainsUnbond) {
    console.log('Parsing lone unbond sequence event');
    // Lone Unbond: delegator unstaked
    const eventObj = {
      address: eventCaller,
      from: eventFrom,
      stake: eventAmount,
      round: eventWhen,
      transactionHash: currentTx,
      blockNumber: currentBlock,
      blockTime: currentTime
    }
    if (!CONF_DISABLE_DB) {
      const dbObj = new UnbondEvent(eventObj);
      await dbObj.save();
    }
    updateMonthlyUnbond(eventObj.blockTime, eventObj.stake);
    alreadyHasMonthlyStatRefresh = {};
    unbondEventCache.push(eventObj);
    alreadyHasAnyRefresh = {};
    alreadyHasUnbondRefresh = {};
  } else if (eventContainsBond) {
    console.log('Parsing lone bond sequence event');
    // Lone Bond: new delegator (Stake event)
    const eventObj = {
      address: eventCaller,
      from: eventFrom, // Should be 0x0000000000000000000000000000000000000000
      to: eventTo,
      stake: eventAmount,
      transactionHash: currentTx,
      blockNumber: currentBlock,
      blockTime: currentTime
    }
    if (!CONF_DISABLE_DB) {
      const dbObj = new StakeEvent(eventObj);
      await dbObj.save();
    }
    updateMonthlyNewDelegator(eventObj.blockTime, eventObj.stake);
    alreadyHasMonthlyStatRefresh = {};
    stakeEventCache.push(eventObj);
    alreadyHasAnyRefresh = {};
    alreadyHasStakeRefresh = {};
  } else if (eventContainsRebond) {
    console.log('Parsing lone rebond sequence event');
    // Lone Rebond: delegator increased their stake (Stake event)
    const eventObj = {
      address: eventCaller,
      to: eventTo,
      stake: eventAmount,
      transactionHash: currentTx,
      blockNumber: currentBlock,
      blockTime: currentTime
    }
    if (!CONF_DISABLE_DB) {
      const dbObj = new StakeEvent(eventObj);
      await dbObj.save();
      // No monthly stats
    }
    stakeEventCache.push(eventObj);
    alreadyHasAnyRefresh = {};
    alreadyHasStakeRefresh = {};
  } else {
    console.log('Skipping unknown sequence event');
  }
}

// Passes incoming event into parseAnyEvent or into parseCache
const onNewEvent = async function (thisEvent) {
  const thisName = thisEvent.name;
  // If [Bond, Rebond, Unbond, TransferBond], pass to cache and set timeouts
  if (thisName === "Bond" || thisName === "Rebond" || thisName === "TranscoderActivated"
    || thisName === "Unbond" || thisName === "TransferBond") {
    parseCache.push(thisEvent);
    lastTxTime = new Date().getTime();
    // Else pass to any-event-parser
  } else {
    parseAnyEvent(thisEvent);
  }
}

/*

BLOCKS - LIVEPEER ROUNDS
Gets livepeer round number for a given block number
Gets entire round details if the round does not exist yet
Saves entire round details as separate data point as well
Mutates roundCache to contain the new round
Mutates the Event in the database to contain the round number

*/

let roundCache = [];

const getRoundInfo = async function (roundNumber) {
  // Get round info from gql
  const roundQuery = gql`{
    rounds(where: {id: "${roundNumber}"}) {
      id
      length
      startBlock
      endBlock
      mintableTokens
      volumeETH
      volumeUSD
      totalActiveStake
      totalSupply
      participationRate
      movedStake
      newStake
    }
  }
  `;
  const roundObj = await request("https://api.thegraph.com/subgraphs/name/livepeer/arbitrum-one", roundQuery);
  // Not found
  if (!roundObj || !roundObj.rounds || !roundObj.rounds.length) {
    console.log("No round found with number " + roundNumber);
    return {};
  }
  const thisRoundObj = roundObj.rounds[0];
  // Update cache
  var wasCached = false;
  for (var idx = 0; idx < roundCache.length; idx++) {
    if (roundCache[idx].number == roundNumber){
      wasCached = true;
      roundCache[idx].startBlock = thisRoundObj.startBlock;
      roundCache[idx].endBlock = thisRoundObj.endBlock;
      roundCache[idx].mintableTokens = thisRoundObj.mintableTokens;
      roundCache[idx].volumeEth = thisRoundObj.volumeETH;
      roundCache[idx].volumeUsd = thisRoundObj.volumeUSD;
      roundCache[idx].totalActiveStake = thisRoundObj.totalActiveStake;
      roundCache[idx].totalSupply = thisRoundObj.totalSupply;
      roundCache[idx].participationRate = thisRoundObj.participationRate;
      roundCache[idx].movedStake = thisRoundObj.movedStake;
      roundCache[idx].newStake = thisRoundObj.newStake;
    }
  }
  // FindAndUpdate
  if (!CONF_DISABLE_DB) {
    // Update DB entry
    const doc = await Round.findOneAndUpdate({
      number: roundNumber
    }, {
      startBlock: thisRoundObj.startBlock,
      endBlock: thisRoundObj.endBlock,
      mintableTokens: thisRoundObj.mintableTokens,
      volumeEth: thisRoundObj.volumeETH,
      volumeUsd: thisRoundObj.volumeUSD,
      totalActiveStake: thisRoundObj.totalActiveStake,
      totalSupply: thisRoundObj.totalSupply,
      participationRate: thisRoundObj.participationRate,
      movedStake: thisRoundObj.movedStake,
      newStake: thisRoundObj.newStake
    }, {
      new: true
    });
    if (!wasCached){
      roundCache.push({
        number: doc.number,
        transactionHash: doc.transactionHash,
        blockNumber: doc.blockNumber,
        startBlock: doc.startBlock,
        endBlock: doc.endBlock,
        mintableTokens: doc.mintableTokens,
        volumeETH: doc.volumeETH,
        volumeUSD: doc.volumeUSD,
        totalActiveStake: doc.totalActiveStake,
        totalSupply: doc.totalSupply,
        participationRate: doc.participationRate,
        movedStake: doc.movedStake,
        newStake: doc.newStake
      });
    }
    return ({
        number: doc.number,
        transactionHash: doc.transactionHash,
        blockNumber: doc.blockNumber,
        startBlock: doc.startBlock,
        endBlock: doc.endBlock,
        mintableTokens: doc.mintableTokens,
        volumeETH: doc.volumeETH,
        volumeUSD: doc.volumeUSD,
        totalActiveStake: doc.totalActiveStake,
        totalSupply: doc.totalSupply,
        participationRate: doc.participationRate,
        movedStake: doc.movedStake,
        newStake: doc.newStake
    });
  }
}

apiRouter.post("/getRoundInfo", async (req, res) => {
  try {
    const now = new Date().getTime();
    const { roundNumber } = req.body;
    if (roundNumber) {
      console.log("Getting round info for round " + roundNumber);
      // See if it is cached
      for (const thisRound of roundCache) {
        if (thisRound.round == roundNumber) {
          // Check if it contains one of the detailed fields
          if (thisRound.endBlock) {
            // Check timeout if the round has not elapsed
            if (thisRound.endBlock >= latestL1Block
              && (now - thisRound.blockTime) > 1800000) {
              console.log('Round should update round details');
              break;
            }
            res.send(thisRound);
            return;
          } else {
            console.log('Round should init round details');
            break;
          }
        }
      }
      // Get block info from thegraph
      const thisRoundInfo = await getRoundInfo(roundNumber);
      res.send(thisRoundInfo);
      return;
    }
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});
// Returns entire orch score mapping cache
apiRouter.get("/getAllRounds", async (req, res) => {
  try {
    res.send(roundCache);
  } catch (err) {
    res.status(400).send(err);
  }
});



/*

SMART CONTRACT EVENTS - SYNC BLOCKS

*/

let hasError = false;

// Syncs events database
const syncEvents = function (toBlock) {
  console.log("Starting sync process for Bonding Manager events for blocks " + lastBlockEvents + "->" + toBlock);
  isEventSyncing = true;
  let lastTxSynced = 0;
  // Then do a sync from last found until latest known
  bondingManagerContract.getPastEvents("allEvents", { fromBlock: lastBlockEvents + 1, toBlock: toBlock }, async (error, events) => {
    try {
      if (error) {
        throw error
      }
      let size = events.length;
      console.log("Parsing " + size + " events");
      if (!size) {
        if (toBlock == 'latest') {
          lastBlockEvents = latestBlockInChain;
        } else {
          lastBlockEvents = toBlock;
        }
      }
      for (const event of events) {
        if (event.blockNumber > lastBlockEvents) {
          lastBlockEvents = event.blockNumber;
        }
        const thisBlock = await getBlock(event.blockNumber);
        const eventObj = {
          address: event.address,
          transactionHash: event.transactionHash,
          transactionUrl: "https://arbiscan.io/tx/" + event.transactionHash,
          name: event.event,
          data: event.returnValues,
          blockNumber: thisBlock.number,
          blockTime: thisBlock.timestamp
        }
        if (!CONF_DISABLE_DB) {
          const dbObj = new Event(eventObj);
          await dbObj.save();
        }
        eventsCache.push(eventObj);

        // Parse old sequence events if TX changes
        if (lastTxSynced != event.transactionHash && parseCache.length) {
          parseSequenceEvent();
        }
        lastTxSynced = event.transactionHash;
        // Parse current Event
        onNewEvent(eventObj);
      }
      // Parse old sequence events if we have parsed all events in requested blocks
      if (parseCache.length) {
        parseSequenceEvent();
      }
    }
    catch (err) {
      console.log("FATAL ERROR: ", err);
      hasError = true;
      isEventSyncing = false;
      return;
    }
    isEventSyncing = false;
  });
}
// Syncs tickets database
const syncTickets = function (toBlock) {
  console.log("Starting sync process for Ticket Broker events for blocks " + lastBlockTickets + "->" + toBlock);
  isTicketSyncing = true;
  // Then do a sync from last found until latest known
  ticketBrokerContract.getPastEvents("allEvents", { fromBlock: lastBlockTickets + 1, toBlock: toBlock }, async (error, events) => {
    try {
      if (error) {
        throw error
      }
      let size = events.length;
      console.log("Parsing " + size + " tickets");
      if (!size) {
        if (toBlock == 'latest') {
          lastBlockTickets = latestBlockInChain;
        } else {
          lastBlockTickets = toBlock;
        }
      }
      for (const event of events) {
        if (event.blockNumber > lastBlockTickets) {
          lastBlockTickets = event.blockNumber;
        }
        const thisBlock = await getBlock(event.blockNumber);
        const eventObj = {
          address: event.address,
          transactionHash: event.transactionHash,
          transactionUrl: "https://arbiscan.io/tx/" + event.transactionHash,
          name: event.event,
          data: event.returnValues,
          blockNumber: thisBlock.number,
          blockTime: thisBlock.timestamp
        }
        if (!CONF_DISABLE_DB) {
          const dbObj = new Ticket(eventObj);
          await dbObj.save();
        }
        ticketsCache.push(eventObj);
        // Parse current Event
        onNewEvent(eventObj);
      }
    }
    catch (err) {
      console.log("FATAL ERROR: ", err);
      hasError = true;
      isTicketSyncing = false;
      return;
    }
    isTicketSyncing = false;
  });
}
// Syncs rounds database
const syncRounds = function (toBlock) {
  console.log("Starting sync process for Rounds Manager events for blocks " + lastBlockRounds + "->" + toBlock);
  isRoundSyncing = true;
  // Then do a sync from last found until latest known
  roundsManagerContract.getPastEvents("allEvents", { fromBlock: lastBlockRounds + 1, toBlock: toBlock }, async (error, events) => {
    try {
      if (error) {
        throw error
      }
      let size = events.length;
      console.log("Parsing " + size + " rounds");
      if (!size) {
        if (toBlock == 'latest') {
          lastBlockRounds = latestBlockInChain;
        } else {
          lastBlockRounds = toBlock;
        }
      }
      for (const event of events) {
        if (event.blockNumber > lastBlockRounds) {
          lastBlockRounds = event.blockNumber;
        }
        // Only parse initRound events
        if (event.event != 'NewRound') {
          console.log('Skipping Round Event of type ' + event.event);
          continue;
        }
        const thisBlock = await getBlock(event.blockNumber);
        const eventObj = {
          number: event.returnValues.round,
          transactionHash: event.transactionHash,
          blockNumber: thisBlock.number,
          blockTime: thisBlock.timestamp
        }
        // Cache & store
        if (!CONF_DISABLE_DB) {
          const dbObj = new Round(eventObj);
          await dbObj.save();
        }
        roundCache.push(eventObj);
      }
    }
    catch (err) {
      console.log("FATAL ERROR: ", err);
      hasError = true;
      isRoundSyncing = false;
      return;
    }
    isRoundSyncing = false;
  });
}

// Retrieves stuff from DB on first boot
const initSync = async function () {
  startedInitSync = true;
  // First collection -> cache
  // Get all parsed blocks
  blockCache = await Block.find({}, {
    blockNumber: 1,
    blockTime: 1
  });
  console.log("Retrieved existing Blocks of size " + blockCache.length);
  // Get all parsed Events
  eventsCache = await Event.find({}, {
    address: 1,
    transactionHash: 1,
    transactionUrl: 1,
    name: 1,
    data: 1,
    blockNumber: 1,
    blockTime: 1,
    _id: 0
  });
  console.log("Retrieved existing raw Events of size " + eventsCache.length);
  // Get all parsedTickets
  ticketsCache = await Ticket.find({}, {
    address: 1,
    transactionHash: 1,
    transactionUrl: 1,
    name: 1,
    data: 1,
    blockNumber: 1,
    blockTime: 1,
    _id: 0
  });
  console.log("Retrieved existing raw Tickets of size " + ticketsCache.length);
  // Then determine latest block number parsed based on collection
  for (var idx = 0; idx < eventsCache.length; idx++) {
    const thisBlock = eventsCache[idx];
    if (thisBlock.blockNumber > lastBlockEvents) {
      lastBlockEvents = thisBlock.blockNumber;
    }
  }
  console.log("Latest Event block parsed is " + lastBlockEvents);
  // Then determine latest block number parsed based on collection
  for (var idx = 0; idx < ticketsCache.length; idx++) {
    const thisBlock = ticketsCache[idx];
    if (thisBlock.blockNumber > lastBlockTickets) {
      lastBlockTickets = thisBlock.blockNumber;
    }
  }
  console.log("Latest Ticket block parsed is " + lastBlockTickets);
  // Get all parsed update events and cache them
  updateEventCache = await UpdateEvent.find({}, {
    address: 1,
    rewardCommission: 1,
    feeCommission: 1,
    transactionHash: 1,
    blockNumber: 1,
    blockTime: 1,
    blockRound: 1,
    _id: 0
  });
  // Get all parsed reward events and cache them
  rewardEventCache = await RewardEvent.find({}, {
    address: 1,
    amount: 1,
    transactionHash: 1,
    blockNumber: 1,
    blockTime: 1,
    blockRound: 1,
    _id: 0
  });
  // Get all parsed claim events and cache them
  claimEventCache = await ClaimEvent.find({}, {
    address: 1,
    fees: 1,
    rewards: 1,
    startRound: 1,
    endRound: 1,
    transactionHash: 1,
    blockNumber: 1,
    blockTime: 1,
    blockRound: 1,
    _id: 0
  });
  // Get all parsed withdraw fees events and cache them
  withdrawFeesEventCache = await WithdrawFeesEvent.find({}, {
    address: 1,
    amount: 1,
    transactionHash: 1,
    blockNumber: 1,
    blockTime: 1,
    blockRound: 1,
    _id: 0
  });
  // Get all parsed withdraw stake events and cache them
  withdrawStakeEventCache = await WithdrawStakeEvent.find({}, {
    address: 1,
    round: 1,
    amount: 1,
    transactionHash: 1,
    blockNumber: 1,
    blockTime: 1,
    blockRound: 1,
    _id: 0
  });
  // Get all parsed transfer winning ticket events and cache them
  transferTicketEventCache = await TransferEvent.find({}, {
    address: 1,
    to: 1,
    amount: 1,
    transactionHash: 1,
    blockNumber: 1,
    blockTime: 1,
    blockRound: 1,
    _id: 0
  });
  // Get all parsed redeem winning ticket events and cache them
  redeemTicketEventCache = await RedeemEvent.find({}, {
    address: 1,
    amount: 1,
    transactionHash: 1,
    blockNumber: 1,
    blockTime: 1,
    blockRound: 1,
    _id: 0
  });
  for (const winner of redeemTicketEventCache) {
    winningTicketCache.push({
      address: winner.address,
      amount: winner.amount,
      transactionHash: winner.transactionHash,
      blockNumber: winner.blockNumber,
      blockTime: winner.blockTime * 1000
    });
  }
  // Get all parsed orchestrator activation events and cache them
  activateEventCache = await ActivateEvent.find({}, {
    address: 1,
    initialStake: 1,
    round: 1,
    transactionHash: 1,
    blockNumber: 1,
    blockTime: 1,
    blockRound: 1,
    _id: 0
  });
  // Get all parsed unbond events and cache them
  unbondEventCache = await UnbondEvent.find({}, {
    address: 1,
    from: 1,
    stake: 1,
    round: 1,
    transactionHash: 1,
    blockNumber: 1,
    blockTime: 1,
    blockRound: 1,
    _id: 0
  });
  // Get all parsed stake events and cache them
  stakeEventCache = await StakeEvent.find({}, {
    address: 1,
    from: 1,
    to: 1,
    stake: 1,
    transactionHash: 1,
    blockNumber: 1,
    blockTime: 1,
    blockRound: 1,
    _id: 0
  });
  // Get all parsed monthly stats and cache them
  monthlyStatCache = await MonthlyStat.find({}, {
    year: 1,
    month: 1,
    reactivationCount: 1,
    activationCount: 1,
    activationInitialSum: 1,
    unbondCount: 1,
    unbondStakeSum: 1,
    rewardCount: 1,
    rewardAmountSum: 1,
    claimCount: 1,
    claimRewardSum: 1,
    claimFeeSum: 1,
    withdrawStakeCount: 1,
    withdrawStakeAmountSum: 1,
    withdrawFeesCount: 1,
    withdrawFeesAmountSum: 1,
    bondCount: 1,
    bondStakeSum: 1,
    moveStakeCount: 1,
    moveStakeSum: 1,
    winningTicketsReceivedCount: 1,
    winningTicketsReceivedSum: 1,
    winningTicketsReceived: 1,
    winningTicketsSent: 1,
    winningTicketsRedeemedCount: 1,
    winningTicketsRedeemedSum: 1,
    winningTicketsRedeemed: 1,
    latestCommission: 1,
    latestTotalStake: 1,
    testScores: 1,
    _id: 0
  });
  // Get all graph data points
  commissionDataPointCache = await CommissionDataPoint.find({}, {
    address: 1,
    feeCommission: 1,
    rewardCommission: 1,
    timestamp: 1,
    _id: 0
  });
  totalStakeDataPoint = await TotalStakeDataPoint.find({}, {
    address: 1,
    totalStake: 1,
    timestamp: 1,
    _id: 0
  });
  // Get all round info
  roundCache = await Round.find({}, {
    number: 1,
    transactionHash: 1,
    blockNumber: 1,
    blockTime: 1,
    lengthBlocks: 1,
    startBlock: 1,
    endBlock: 1,
    mintableTokens: 1,
    volumeEth: 1,
    volumeUsd: 1,
    totalActiveStake: 1,
    totalSupply: 1,
    participationRate: 1,
    movedStake: 1,
    newStake: 1,
    _id: 0
  })
  console.log("Retrieved existing rounds of size " + roundCache.length);
  // Then determine latest block number parsed based on collection
  for (var idx = 0; idx < roundCache.length; idx++) {
    const thisRound = roundCache[idx];
    if (thisRound.blockNumber > lastBlockRounds) {
      lastBlockRounds = thisRound.blockNumber;
    }
  }
  console.log("Latest Round block parsed is " + lastBlockRounds);
}

let cycle = 0;
// Does the actual looping over last parsed block -> latest block in chain
const handleSync = async function () {
  try {
    if (!CONF_DISABLE_DB && !startedInitSync) {
      console.log("Preloading all the things from the database");
      await initSync();
    }
    cycle++;
    console.log('Starting new sync cycle #' + cycle);
    isSyncing = true;
    // Get latest blocks in chain
    var latestBlock = await deprWeb3main.eth.getBlockNumber();
    if (latestBlock > latestL1Block) {
      latestL1Block = latestBlock;
      console.log("Latest L1 Eth block changed to " + latestL1Block);
    }
    latestBlock = await deprWeb3.eth.getBlockNumber();
    if (latestBlock > latestBlockInChain) {
      latestBlockInChain = latestBlock;
      console.log("Latest L2 Eth block changed to " + latestBlockInChain);
    } else {
      // If there are no new blocks, wait for 10 seconds before retrying
      console.log("No new blocks. Sleeping for 10 seconds...");
      setTimeout(() => {
        handleSync();
      }, 10000);
      return;
    }
    console.log("Needs to sync " + (latestBlockInChain - lastBlockEvents) + " blocks for Events sync");
    console.log("Needs to sync " + (latestBlockInChain - lastBlockTickets) + " blocks for Tickets sync");
    console.log("Needs to sync " + (latestBlockInChain - lastBlockRounds) + " blocks for Rounds sync");
    // Batch requests when sync is large, mark if we are going to reach latestBlockInChain in this round 
    let getFinalTickets = false;
    let toTickets = 'latest';
    if (latestBlock - lastBlockTickets > 1000000) {
      toTickets = lastBlockTickets + 1000000;
    } else {
      getFinalTickets = true;
    }
    let getFinalEvents = false;
    let toEvents = 'latest';
    if (latestBlock - lastBlockEvents > 1000000) {
      toEvents = lastBlockEvents + 1000000;
    } else {
      getFinalEvents = true;
    }
    let getFinalRounds = false;
    let toRounds = 'latest';
    if (latestBlock - lastBlockRounds > 1000000) {
      toRounds = lastBlockRounds + 1000000;
    } else {
      getFinalRounds = true;
    }
    // Start initial sync for this sync round
    syncTickets(toTickets);
    syncEvents(toEvents);
    syncRounds(toRounds);
    // Then loop until we have reached the last known block
    while (isEventSyncing || isTicketSyncing || isRoundSyncing
      || !getFinalTickets || !getFinalEvents || !getFinalRounds) {
      await sleep(500);
      if (hasError) {
        throw ("Error while syncing");
      }
      if (isEventSyncing) {
        console.log("Parsed " + lastBlockEvents + " out of " + latestBlockInChain + " blocks for Event sync");
      } else if (!getFinalEvents) {
        // Start next batch for events
        toEvents = 'latest';
        if (latestBlock - lastBlockEvents > 1000000) {
          toEvents = lastBlockEvents + 1000000;
        } else {
          getFinalEvents = true;
        }
        syncEvents(toEvents);
      }
      if (isTicketSyncing) {
        console.log("Parsed " + lastBlockTickets + " out of " + latestBlockInChain + " blocks for Ticket sync");
      } else if (!getFinalTickets) {
        // Start next batch for tickets
        toTickets = 'latest';
        if (latestBlock - lastBlockTickets > 1000000) {
          toTickets = lastBlockTickets + 1000000;
        } else {
          getFinalTickets = true;
        }
        syncTickets(toTickets);
      }
      if (isRoundSyncing) {
        console.log("Parsed " + lastBlockRounds + " out of " + latestBlockInChain + " blocks for Round sync");
      } else if (!getFinalRounds) {
        // Start next batch for tickets
        toRounds = 'latest';
        if (latestBlock - lastBlockRounds > 1000000) {
          toRounds = lastBlockRounds + 1000000;
        } else {
          getFinalRounds = true;
        }
        syncRounds(toRounds);
      }
    }
    isSyncing = false;
    setTimeout(() => {
      handleSync();
    }, 10000);
    return;
  }
  catch (err) {
    console.log(err);
    hasError = false;
    console.log("Error while syncing. Retrying in 30 seconds");
    console.log("latestBlockInChain " + latestBlockInChain);
    console.log("lastBlockEvents " + lastBlockEvents);
    console.log("lastBlockTickets " + lastBlockTickets);
    console.log("lastBlockRounds " + lastBlockRounds);
    isSyncing = false;
    setTimeout(() => {
      handleSync();
    }, 30000)
  }
};
if (!isSyncing && !CONF_SIMPLE_MODE) {
  console.log("Starting sync process");
  handleSync();
}

// Exports cache of raw smart contract events
apiRouter.get("/getEvents", async (req, res) => {
  try {
    res.send(eventsCache);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Exports cache of raw smart contract ticket events
apiRouter.get("/getTickets", async (req, res) => {
  try {
    res.send(ticketsCache);
  } catch (err) {
    res.status(400).send(err);
  }
});

/*

COINMARKETCAP
Only stored locally in cache

*/

let cmcPriceGet = 0;
let ethPrice = 0;
let lptPrice = 0;
let cmcQuotes = {};
let cmcCache = {};

// Splits of raw CMC object into coin quote data
const parseCmc = async function () {
  try {
    if (!cmcEnabled) {
      return;
    }
    console.log("Getting new CMC data");
    cmcCache = await cmcClient.getTickers({ limit: 200 });
    for (var idx = 0; idx < cmcCache.data.length; idx++) {
      const coinData = cmcCache.data[idx];
      // Handle specific coins only for the grafana endpoint
      if (coinData.symbol == "ETH") {
        ethPrice = coinData.quote.USD.price;
      } else if (coinData.symbol == "LPT") {
        lptPrice = coinData.quote.USD.price;
      }
      // Sort by name->quotes for quotes endpoint
      cmcQuotes[coinData.symbol] = coinData.quote.USD;
    }
  }
  catch (err) {
    res.status(400).send(err);
  }
}

// Exports raw CoinMarketCap info
apiRouter.get("/cmc", async (req, res) => {
  try {
    const now = new Date().getTime();
    // Update cmc once their data has expired
    if (now - cmcPriceGet > CONF_TIMEOUT_CMC) {
      cmcPriceGet = now;
      await parseCmc();
    }
    res.send(cmcCache);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Exports top 200 coin quotes
apiRouter.get("/quotes", async (req, res) => {
  try {
    const now = new Date().getTime();
    // Update cmc once their data has expired
    if (now - cmcPriceGet > CONF_TIMEOUT_CMC) {
      cmcPriceGet = now;
      await parseCmc();
    }
    res.send(cmcQuotes);
  } catch (err) {
    res.status(400).send(err);
  }
});

/*

ARBITRUM DATA
Only stored locally in cache

*/

let l2Gwei = 0;
let l1Gwei = 0;
let l2block = 0;
let l1block = 0;
let arbGet = 0;

// Gas limits on common contract interactions
// 50000 gas for approval when creating a new O
const redeemRewardGwei = 1053687;
const claimTicketGwei = 1333043;
const withdrawFeeGwei = 688913;
const stakeFeeGwei = 680000;
const commissionFeeGwei = 140000;
const serviceUriFee = 51000;
let redeemRewardCostL1 = 0;
let redeemRewardCostL2 = 0;
let claimTicketCostL1 = 0;
let claimTicketCostL2 = 0;
let withdrawFeeCostL1 = 0;
let withdrawFeeCostL2 = 0;
let stakeFeeCostL1 = 0;
let stakeFeeCostL2 = 0;
let commissionFeeCostL1 = 0;
let commissionFeeCostL2 = 0;
let serviceUriFeeCostL1 = 0;
let serviceUriFeeCostL2 = 0;

// Queries Alchemy for block info and gas fees
const parseL1Blockchain = async function () {
  try {
  const l1Wei = await deprWeb3main.eth.getGasPrice();
  l1block = await deprWeb3main.eth.getBlockNumber();
  l1Gwei = l1Wei / 1000000000;
  redeemRewardCostL1 = (redeemRewardGwei * l1Gwei) / 1000000000;
  claimTicketCostL1 = (claimTicketGwei * l1Gwei) / 1000000000;
  withdrawFeeCostL1 = (withdrawFeeGwei * l1Gwei) / 1000000000;
  stakeFeeCostL1 = (stakeFeeGwei * l1Gwei) / 1000000000;
  commissionFeeCostL1 = (commissionFeeGwei * l1Gwei) / 1000000000;
  serviceUriFeeCostL1 = (serviceUriFee * l1Gwei) / 1000000000;
 } catch (err) {
    console.log(err);
  }
}
const parseL2Blockchain = async function () {
  try {
  const l2Wei = await deprWeb3.eth.getGasPrice();
  l2block = await deprWeb3.eth.getBlockNumber();
  l2Gwei = l2Wei / 1000000000;
  redeemRewardCostL2 = (redeemRewardGwei * l2Gwei) / 1000000000;
  claimTicketCostL2 = (claimTicketGwei * l2Gwei) / 1000000000;
  withdrawFeeCostL2 = (withdrawFeeGwei * l2Gwei) / 1000000000;
  stakeFeeCostL2 = (stakeFeeGwei * l2Gwei) / 1000000000;
  commissionFeeCostL2 = (commissionFeeGwei * l2Gwei) / 1000000000;
  serviceUriFeeCostL2 = (serviceUriFee * l2Gwei) / 1000000000;
 } catch (err) {
    console.log(err);
  }

}
const parseEthBlockchain = async function () {
  console.log("Getting new blockchain data");
  const l1Promise = parseL1Blockchain();
  const l2Promise = parseL2Blockchain();
  await Promise.all([l1Promise, l2Promise]);
  console.log("done getting blockchain data");
}

// Exports gas fees and contract prices
apiRouter.get("/blockchains", async (req, res) => {
  try {
    const now = new Date().getTime();
    // Update blockchain data if the cached data has expired
    if (now - arbGet > CONF_TIMEOUT_ALCHEMY) {
      arbGet = now;
      await parseEthBlockchain();
    }
    res.send({
      timestamp: now,
      l1block,
      l2block,
      blockchainTime: arbGet,
      l1GasFeeInGwei: l1Gwei,
      l2GasFeeInGwei: l2Gwei,
      redeemRewardCostL1,
      redeemRewardCostL2,
      claimTicketCostL1,
      claimTicketCostL2,
      withdrawFeeCostL1,
      withdrawFeeCostL2,
      stakeFeeCostL1,
      stakeFeeCostL2,
      commissionFeeCostL1,
      commissionFeeCostL2,
      serviceUriFeeCostL1,
      serviceUriFeeCostL2,
    });
  } catch (err) {
    res.status(400).send(err);
  }
});

/*

THEGRAPH - ORCHESTRATOR
Latest commission and totalStake stored in mongoDB (monthlyStat.js) and all in local cache

*/

let orchestratorCache = [];

const mutateNewCommissionRates = async function (address, feeCommission, rewardCommission) {
  console.log("Found new commission rates for " + address);
  const dateObj = new Date();
  const now = dateObj.getTime();
  const thisMonth = dateObj.getMonth();
  const thisYear = dateObj.getFullYear();
  // Convert weird format to actual percentages
  rewardCommission = (rewardCommission / 10000).toFixed(2);
  feeCommission = (100 - (feeCommission / 10000)).toFixed(2);
  // Create new data point
  if (!CONF_DISABLE_DB) {
    const dbObj = new CommissionDataPoint({
      address: address,
      feeCommission: feeCommission,
      rewardCommission: rewardCommission,
      timestamp: now
    });
    await dbObj.save();
  }
  // Mutate monthly stats
  // Get DB entry
  const doc = await MonthlyStat.findOne({
    year: thisYear,
    month: thisMonth
  }, {
    latestCommission: 1
  });
  // Check to see if the doc's embedded latestCommission already contains this address
  let hasModified = false;
  for (const eventObj of doc.latestCommission) {
    // If so, update existing entry
    if (eventObj.address == address) {
      await MonthlyStat.updateOne({
        year: thisYear,
        month: thisMonth,
        'latestCommission.address': address
      }, {
        $set: {
          'latestCommission.$.feeCommission': feeCommission,
          'latestCommission.$.rewardCommission': rewardCommission,
          'latestCommission.$.timestamp': now
        }
      });
      hasModified = true;
      break;
    }
  }
  // Else push new data to latestCommission
  if (!hasModified) {
    await MonthlyStat.updateOne({
      year: thisYear,
      month: thisMonth,
      'latestCommission.address': { '$ne': address }
    }, {
      $push: {
        'latestCommission': {
          address: address,
          feeCommission: feeCommission,
          rewardCommission: rewardCommission,
          timestamp: now
        }
      }
    });
  }
}

const mutateNewGlobalStake = async function (address, globalStake) {
  console.log("Found new total stake for " + address);
  const dateObj = new Date();
  const now = dateObj.getTime();
  const thisMonth = dateObj.getMonth();
  const thisYear = dateObj.getFullYear();
  // Create new data point
  if (!CONF_DISABLE_DB) {
    const dbObj = new TotalStakeDataPoint({
      address: address,
      totalStake: globalStake,
      timestamp: now
    });
    await dbObj.save();
  }
  // Mutate monthly stats
  // Get DB entry
  const doc = await MonthlyStat.findOne({
    year: thisYear,
    month: thisMonth
  }, {
    latestTotalStake: 1
  });
  // Check to see if the doc's embedded latestTotalStake already contains this address
  let hasModified = false;
  for (const eventObj of doc.latestTotalStake) {
    // If so, update existing entry
    if (eventObj.address == address) {
      await MonthlyStat.updateOne({
        year: thisYear,
        month: thisMonth,
        'latestTotalStake.address': address
      }, {
        $set: {
          'latestTotalStake.$.totalStake': globalStake,
          'latestTotalStake.$.timestamp': now
        }
      });
      hasModified = true;
      break;
    }
  }
  // Else push new data to latestTotalStake
  if (!hasModified) {
    await MonthlyStat.updateOne({
      year: thisYear,
      month: thisMonth,
      'latestTotalStake.address': { '$ne': address }
    }, {
      $push: {
        'latestTotalStake': {
          address: address,
          totalStake: globalStake,
          timestamp: now
        }
      }
    });
  }
}

const mutateDynamicStatsFromDB = async function (orchestratorObj) {
  const dateObj = new Date();
  const thisMonth = dateObj.getMonth();
  const thisYear = dateObj.getFullYear();
  // Compare with latest entry in monthly statistics for the current month
  const doc = await MonthlyStat.findOne({
    year: thisYear,
    month: thisMonth
  }, {
    latestCommission: 1,
    latestTotalStake: 1
  });
  if (!doc) {
    return;
  }
  let oldFeeCommission = -1;
  let oldRewardCommission = -1;
  let oldTotalStake = -1;
  // Determine latest commission rates
  for (var orch of doc.latestCommission) {
    if (orch.address == orchestratorObj.id) {
      oldFeeCommission = orch.feeCommission;
      oldRewardCommission = orch.rewardCommission;
      break;
    }
  }
  // Determine latest total stake
  for (var orch of doc.latestTotalStake) {
    if (orch.address == orchestratorObj.id) {
      oldTotalStake = orch.totalStake;
      break;
    }
  }
  // Convert weird format to actual percentages
  let newRewardCommission = (orchestratorObj.rewardCut / 10000).toFixed(2);
  let newFeeCommission = (100 - (orchestratorObj.feeShare / 10000)).toFixed(2);
  // If data changed, mutate
  if (oldRewardCommission != newRewardCommission) {
    mutateNewCommissionRates(orchestratorObj.id, orchestratorObj.feeShare, orchestratorObj.rewardCut);
  } else if (oldFeeCommission != newFeeCommission) {
    mutateNewCommissionRates(orchestratorObj.id, orchestratorObj.feeShare, orchestratorObj.rewardCut);
  }
  if (oldTotalStake != orchestratorObj.totalStake) {
    mutateNewGlobalStake(orchestratorObj.id, orchestratorObj.totalStake);
  }
}

const mutateDynamicStatsFromCache = async function (oldOrchestratorObj, newOrchestratorObj) {
  // Check with monthly stats in cache to see if it differs
  if (oldOrchestratorObj.rewardCut != newOrchestratorObj.rewardCut) {
    mutateNewCommissionRates(newOrchestratorObj.id, newOrchestratorObj.feeShare, newOrchestratorObj.rewardCut);
  } else if (oldOrchestratorObj.feeShare != newOrchestratorObj.feeShare) {
    mutateNewCommissionRates(newOrchestratorObj.id, newOrchestratorObj.feeShare, newOrchestratorObj.rewardCut);
  }
  if (oldOrchestratorObj.totalStake != newOrchestratorObj.totalStake) {
    mutateNewGlobalStake(newOrchestratorObj.id, newOrchestratorObj.totalStake);
  }
}

// Gets info on a given Orchestrator
const parseOrchestrator = async function (reqAddr) {
  console.log("Getting orchestrator data from thegraph for " + reqAddr);
  let wasCached = false;
  try {
    reqAddr = reqAddr.toLowerCase();
    const now = new Date().getTime();
    // Default assume it's the first time we request this Orchestrator
    let needsUpdate = true;
    let orchestratorObj = {};
    // First get cached object
    for (var orch of orchestratorCache) {
      if (orch.id == reqAddr) {
        wasCached = true;
        orchestratorObj = orch;
        break;
      }
    }
    if (wasCached) {
      if (now - orchestratorObj.lastGet < CONF_TIMEOUT_LIVEPEER) {
        needsUpdate = false;
      }
    }
    if (!wasCached || needsUpdate) {
      const orchQuery = gql`{
    transcoder(id: "${reqAddr}") {
        id
        activationRound
        deactivationRound
        active
        status
        lastRewardRound {
          id
          length
          startBlock
          endBlock
          mintableTokens
          volumeETH
          volumeUSD
          totalActiveStake
          totalSupply
          participationRate
          movedStake
          newStake
        }
        rewardCut
        feeShare
        totalStake
        totalVolumeETH
        totalVolumeUSD
        serviceURI
        delegators(first: 1000) {
          id
          bondedAmount
          startRound
        }
        delegator {
          id
          bondedAmount
          startRound
        }
      }
    }
  `;
      orchestratorObj = await request("https://api.thegraph.com/subgraphs/name/livepeer/arbitrum-one", orchQuery);
      orchestratorObj = orchestratorObj.transcoder;
      // Not found
      if (!orchestratorObj) {
        console.log("Pushing null orchestrator " + reqAddr + " @ " + now);
        orchestratorCache.push({ id: reqAddr, lastGet: now });
        return {};
      }
      orchestratorObj.lastGet = now;
      if (wasCached) {
        for (var idx = 0; idx < orchestratorCache.length; idx++) {
          if (orchestratorCache[idx].id == reqAddr) {
            console.log("Updating outdated orchestrator " + orchestratorObj.id + " @ " + now);
            mutateDynamicStatsFromCache(orchestratorObj, orchestratorCache[idx]);
            orchestratorCache[idx] = orchestratorObj;
            break;
          }
        }
      } else {
        console.log("Pushing new orchestrator " + orchestratorObj.id + " @ " + now);
        mutateDynamicStatsFromDB(orchestratorObj);
        orchestratorCache.push(orchestratorObj);
      }
    }
    return orchestratorObj;
  } catch (err) {
    console.log(err);
    if (wasCached) {
      console.log("Thegraph is probably acting up. Returning cached value...");
      for (var idx = 0; idx < orchestratorCache.length; idx++) {
        if (orchestratorCache[idx].id == reqAddr) {
          return orchestratorCache[idx];
        }
      }
    } else {
      console.log("Thegraph is probably acting up, but there is no cached value. Returning null...");
      return {};
    }
  }
}

// Exports info on a given Orchestrator
apiRouter.get("/getOrchestrator", async (req, res) => {
  try {
    let reqOrch = req.query.orch;
    if (!reqOrch || reqOrch == "") {
      reqOrch = CONF_DEFAULT_ORCH;
    }
    const reqObj = await parseOrchestrator(reqOrch);
    res.send(reqObj);
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});
apiRouter.get("/getOrchestratorENS", async (req, res) => {
  try {
    let reqOrch = req.query.orch;
    if (!reqOrch || reqOrch == "") {
      reqOrch = CONF_DEFAULT_ORCH;
    }
    const reqObj = await parseOrchestrator(reqOrch);
    let orchestratorObj = JSON.parse(JSON.stringify(reqObj));
    // Replace delegators with ENS domain names
    for (var idx = 0; idx < orchestratorObj.delegators.length; idx++) {
      for (var idx2 = 0; idx2 < ensDomainCache.length; idx2++) {
        if (ensDomainCache[idx2].address == orchestratorObj.delegators[idx].id) {
          if (ensDomainCache[idx2].domain){
            orchestratorObj.delegators[idx].id = ensDomainCache[idx2].domain;
          }
          break;
        }
      }
    }
    res.send(orchestratorObj);
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});
apiRouter.get("/getOrchestrator/:orch", async (req, res) => {
  try {
    const reqObj = await parseOrchestrator(req.params.orch);
    res.send(reqObj);
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});
apiRouter.post("/getOrchestrator", async (req, res) => {
  try {
    const reqObj = await parseOrchestrator(req.body.orchAddr);
    res.send(reqObj);
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});

// Returns entire orch info cache
apiRouter.get("/getAllOrchInfo", async (req, res) => {
  try {
    res.send(orchestratorCache);
  } catch (err) {
    res.status(400).send(err);
  }
});

/*

THEGRAPH - DELEGATOR
Only stored in local cache

*/

let delegatorCache = [];

// Gets info on a given Delegator
const parseDelegator = async function (reqAddr) {
  console.log("Getting delegator data from thegraph for " + reqAddr);
  reqAddr = reqAddr.toLowerCase();
  const now = new Date().getTime();
  // Default assume it's the first time we request this Orchestrator
  let wasCached = false;
  let needsUpdate = true;
  let delegatorObj = {};
  // First get cached object
  for (var delegator of delegatorCache) {
    if (delegator.id == reqAddr) {
      wasCached = true;
      delegatorObj = delegator;
      break;
    }
  }
  if (wasCached) {
    if (now - delegatorObj.lastGet < CONF_TIMEOUT_LIVEPEER) {
      needsUpdate = false;
    }
  }
  if (!wasCached || needsUpdate) {
    const delegatorQuery = gql`{
      delegators(where: {
        id: "${reqAddr}"
      }){
        id
        delegate {
          id
        }
      }
    }
  `;
    delegatorObj = await request("https://api.thegraph.com/subgraphs/name/livepeer/arbitrum-one", delegatorQuery);
    delegatorObj = delegatorObj.delegators[0];
    // Not found
    if (!delegatorObj) {
      return {};
    }
    delegatorObj.lastGet = now;
    if (wasCached) {
      for (var idx = 0; idx < delegatorCache.length; idx++) {
        if (delegatorCache[idx].id == reqAddr) {
          console.log("Updating outdated delegator " + delegatorObj.id + " @ " + now);
          delegatorCache[idx] = delegatorObj;
          break;
        }
      }
    } else {
      console.log("Pushing new delegator " + delegatorObj.id + " @ " + now);
      delegatorCache.push(delegatorObj);
    }
  }
  return delegatorObj;
}

// Exports info on a given Orchestrator by the address any Delegator delegating to them
apiRouter.get("/getOrchestratorByDelegator", async (req, res) => {
  try {
    const reqDel = req.query.delegatorAddress;
    const delObj = await parseDelegator(reqDel);
    if (delObj && delObj.delegate && delObj.delegate.id) {
      const reqObj = await parseOrchestrator(delObj.delegate.id);
      res.send(JSON.stringify(reqObj));
    } else {
      res.send(JSON.stringify(delObj));
    }
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});
apiRouter.get("/getOrchestratorByDelegator/:delegatorAddress", async (req, res) => {
  try {
    const reqDel = req.params.delegatorAddress;
    const delObj = await parseDelegator(reqDel);
    if (delObj && delObj.delegate && delObj.delegate.id) {
      const reqObj = await parseOrchestrator(delObj.delegate.id);
      res.send(JSON.stringify(reqObj));
    } else {
      res.send(JSON.stringify(delObj));
    }
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});
apiRouter.post("/getOrchestratorByDelegator", async (req, res) => {
  try {
    const reqDel = req.body.delegatorAddress;
    const delObj = await parseDelegator(reqDel);
    if (delObj && delObj.delegate && delObj.delegate.id) {
      const reqObj = await parseOrchestrator(delObj.delegate.id);
      res.send(JSON.stringify(reqObj));
    } else {
      res.send(JSON.stringify(delObj));
    }
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});

// Returns entire delegator info cache
apiRouter.get("/getAllDelInfo", async (req, res) => {
  try {
    res.send(delegatorCache);
  } catch (err) {
    res.status(400).send(err);
  }
});

/*

PROMETHEUS - GRAFANA

*/

// Export livepeer and eth coin prices and L1 Eth gas price
apiRouter.get("/grafana", async (req, res) => {
  try {
    const now = new Date().getTime();
    // Update blockchain data if the cached data has expired
    if (now - arbGet > CONF_TIMEOUT_ALCHEMY) {
arbGet = now;      
await parseEthBlockchain();
    }
    // Update coin prices once their data has expired
    if (now - cmcPriceGet > CONF_TIMEOUT_CMC) {
      await parseCmc();
      cmcPriceGet = now;
    }
    res.send({
      timestamp: now,
      cmcTime: cmcPriceGet,
      blockchainTime: arbGet,
      l1GasFeeInGwei: l1Gwei,
      l2GasFeeInGwei: l2Gwei,
      ethPriceInDollar: ethPrice,
      lptPriceInDollar: lptPrice,
      redeemRewardCostL1,
      redeemRewardCostL2,
      claimTicketCostL1,
      claimTicketCostL2,
      withdrawFeeCostL1,
      withdrawFeeCostL2,
      stakeFeeCostL1,
      stakeFeeCostL2,
      commissionFeeCostL1,
      commissionFeeCostL2,
      serviceUriFeeCostL1,
      serviceUriFeeCostL2,
      quotes: cmcQuotes,
      latestBlockMinedL2: l2block,
      latestBlockMinedL1: l1block
    });
  } catch (err) {
    res.status(400).send(err);
  }
});

// Export livepeer and eth coin prices and L1 Eth gas price
apiRouter.get("/prometheus/:orchAddr", async (req, res) => {
  try {
    const now = new Date().getTime();
    // Update blockchain data if the cached data has expired
    if (now - arbGet > CONF_TIMEOUT_ALCHEMY) {
arbGet = now;      
await parseEthBlockchain();
          }
    // Update coin prices once their data has expired
    if (now - cmcPriceGet > CONF_TIMEOUT_CMC) {
      await parseCmc();
      cmcPriceGet = now;
    }

    // Convert objects into Prometheus output
    let outputString = "";
    // Add L1 gas fee price as gas_l1_gwei
    outputString += "# HELP gas_l1_gwei Gas fees on L1 Ethereum in Gwei.\n";
    outputString += "# TYPE gas_l1_gwei gauge\ngas_l1_gwei ";
    outputString += l1Gwei + "\n\n";
    // Add L2 gas fee price as gas_l2_gwei
    outputString += "# HELP gas_l2_gwei Gas fees on L1 Ethereum in Gwei.\n";
    outputString += "# TYPE gas_l2_gwei gauge\ngas_l2_gwei ";
    outputString += l2Gwei + "\n\n";
    // Add Eth price as coin_eth_price
    outputString += "# HELP coin_eth_price Price of Ethereum in dollars.\n";
    outputString += "# TYPE coin_eth_price gauge\ncoin_eth_price ";
    outputString += ethPrice + "\n\n";
    // Add LPT price as coin_lpt_price
    outputString += "# HELP coin_lpt_price Price of the Livepeer token in dollars.\n";
    outputString += "# TYPE coin_lpt_price gauge\ncoin_lpt_price ";
    outputString += lptPrice + "\n\n";
    // Add L1 redeem reward cost in Eth as price_redeem_reward_l1
    outputString += "# HELP price_redeem_reward_l1 Cost of redeeming reward on L1.\n";
    outputString += "# TYPE price_redeem_reward_l1 gauge\nprice_redeem_reward_l1 ";
    outputString += redeemRewardCostL1 + "\n\n";
    // Add L2 redeem reward cost in Eth as price_redeem_reward_l2
    outputString += "# HELP price_redeem_reward_l2 Cost of redeeming reward on L2.\n";
    outputString += "# TYPE price_redeem_reward_l2 gauge\nprice_redeem_reward_l2 ";
    outputString += redeemRewardCostL1 + "\n\n";
    // Add L1 claim ticket cost in Eth as price_claim_ticket_l1
    outputString += "# HELP price_claim_ticket_l1 Cost of claiming a ticket on L1.\n";
    outputString += "# TYPE price_claim_ticket_l1 gauge\nprice_claim_ticket_l1 ";
    outputString += claimTicketCostL1 + "\n\n";
    // Add L2 claim ticket cost in Eth as price_claim_ticket_l2
    outputString += "# HELP price_claim_ticket_l2 Cost of claiming a ticket on L2.\n";
    outputString += "# TYPE price_claim_ticket_l2 gauge\nprice_claim_ticket_l2 ";
    outputString += claimTicketCostL2 + "\n\n";
    // Add L1 withdraw fee cost in Eth as price_withdraw_fees_l1
    outputString += "# HELP price_withdraw_fees_l1 Cost of withdrawing fees on L1.\n";
    outputString += "# TYPE price_withdraw_fees_l1 gauge\nprice_withdraw_fees_l1 ";
    outputString += withdrawFeeCostL1 + "\n\n";
    // Add L2 withdraw fee cost in Eth as price_withdraw_fees_l2
    outputString += "# HELP price_withdraw_fees_l2 Cost of withdrawing fees on L2.\n";
    outputString += "# TYPE price_withdraw_fees_l2 gauge\nprice_withdraw_fees_l2 ";
    outputString += withdrawFeeCostL2 + "\n\n";
    // Add L1 stake fee cost in Eth as price_stake_fees_l1
    outputString += "# HELP price_stake_fees_l1 Cost of staking on L1.\n";
    outputString += "# TYPE price_stake_fees_l1 gauge\nprice_stake_fees_l1 ";
    outputString += stakeFeeCostL1 + "\n\n";
    // Add L2 stake ticket cost in Eth as price_stake_fees_l2
    outputString += "# HELP price_stake_fees_l2 Cost of staking on L2.\n";
    outputString += "# TYPE price_stake_fees_l2 gauge\nprice_stake_fees_l2 ";
    outputString += stakeFeeCostL2 + "\n\n";
    // Add L1 change commission cost in Eth as price_change_commission_l1
    outputString += "# HELP price_change_commission_l1 Cost of changing commission rates on L1.\n";
    outputString += "# TYPE price_change_commission_l1 gauge\nprice_change_commission_l1 ";
    outputString += commissionFeeCostL1 + "\n\n";
    // Add L2 change commission cost in Eth as price_change_commission_l2
    outputString += "# HELP price_change_commission_l2 Cost of changing commission rates on L2.\n";
    outputString += "# TYPE price_change_commission_l2 gauge\nprice_change_commission_l2 ";
    outputString += commissionFeeCostL2 + "\n\n";
    // Add L1 change service uri cost in Eth as price_change_service_uri_l1
    outputString += "# HELP price_change_service_uri_l1 Cost of changing service uri on L1.\n";
    outputString += "# TYPE price_change_service_uri_l1 gauge\nprice_change_service_uri_l1 ";
    outputString += serviceUriFeeCostL1 + "\n\n";
    // Add L2 change service uri cost in Eth as price_change_service_uri_l2
    outputString += "# HELP price_change_service_uri_l2 Cost of changing service uri on L2.\n";
    outputString += "# TYPE price_change_service_uri_l2 gauge\nprice_change_service_uri_l2 ";
    outputString += serviceUriFeeCostL2 + "\n\n";
    // Add latest Eth and Arbitrum blocks synced
    outputString += "# HELP latest_block_mined_l2 Latest Arbitrum block synced.\n";
    outputString += "# TYPE latest_block_mined_l2 gauge\nlatest_block_mined_l2 ";
    outputString += l2block + "\n\n";
    outputString += "# HELP latest_block_mined_l1 Latest Ethereum block synced.\n";
    outputString += "# TYPE latest_block_mined_l1 gauge\nlatest_block_mined_l1 ";
    outputString += l1block + "\n\n";

    // Get requested orchestrator info if it is requested
    let reqOrch = req.params.orchAddr;
    let orchObj = {};
    if (reqOrch && reqOrch !== "") {
      orchObj = await parseOrchestrator(reqOrch);
      if (orchObj) {
        // Add details on the rewards from the last round
        if (orchObj.lastRewardRound) {
          if (orchObj.lastRewardRound.volumeETH) {
            outputString += "# HELP last_round_reward_eth Total earned fees in Eth from the previous round.\n";
            outputString += "# TYPE last_round_reward_eth gauge\nlast_round_reward_eth ";
            outputString += orchObj.lastRewardRound.volumeETH + "\n\n";
          }
          if (orchObj.lastRewardRound.volumeUSD) {
            outputString += "# HELP last_round_reward_usd Total earned fees in USD from the previous round.\n";
            outputString += "# TYPE last_round_reward_usd gauge\nlast_round_reward_usd ";
            outputString += orchObj.lastRewardRound.volumeUSD + "\n\n";
          }
          if (orchObj.lastRewardRound.participationRate) {
            outputString += "# HELP last_round_participation Participation rate of the previous round.\n";
            outputString += "# TYPE last_round_participation gauge\nlast_round_participation ";
            outputString += orchObj.lastRewardRound.participationRate + "\n\n";
          }
        }
        // Add O reward cut
        if (orchObj.rewardCut) {
          outputString += "# HELP orchestrator_reward_commission Reward commission rate of this Orchestrator.\n";
          outputString += "# TYPE orchestrator_reward_commission gauge\norchestrator_reward_commission ";
          outputString += (orchObj.rewardCut / 10000) + "\n\n";
        }
        // Add O fee cut
        if (orchObj.feeShare) {
          outputString += "# HELP orchestrator_fee_commission Transcoding fee commission rate of this Orchestrator.\n";
          outputString += "# TYPE orchestrator_fee_commission gauge\norchestrator_fee_commission ";
          outputString += (100 - (orchObj.feeShare / 10000)) + "\n\n";
        }
        // Add O total stake
        if (orchObj.totalStake) {
          outputString += "# HELP orchestrator_total_stake Total stake of this Orchestrator.\n";
          outputString += "# TYPE orchestrator_total_stake gauge\norchestrator_total_stake ";
          outputString += orchObj.totalStake + "\n\n";
        }
        // Add O self stake
        if (orchObj.delegator && orchObj.delegator.bondedAmount) {
          outputString += "# HELP orchestrator_self_stake Self stake of this Orchestrator.\n";
          outputString += "# TYPE orchestrator_self_stake gauge\norchestrator_self_stake ";
          outputString += orchObj.delegator.bondedAmount + "\n\n";
        }
        // Add O total fees earned in eth
        if (orchObj.totalVolumeETH) {
          outputString += "# HELP orchestrator_earned_fees_eth Total transcoding rewards of this Orchestrator in Eth.\n";
          outputString += "# TYPE orchestrator_earned_fees_eth counter\norchestrator_earned_fees_eth ";
          outputString += orchObj.totalVolumeETH + "\n\n";
        }
        // Add O total fees earned in usd
        if (orchObj.totalVolumeUSD) {
          outputString += "# HELP orchestrator_earned_fees_usd Total transcoding rewards of this Orchestrator in USD.\n";
          outputString += "# TYPE orchestrator_earned_fees_usd counter\norchestrator_earned_fees_usd ";
          outputString += orchObj.totalVolumeUSD + "\n\n";
        }
      }
    }
    res.setHeader('Content-type', "text/plain; version=0.0.4");
    res.send(outputString);
  } catch (err) {
    res.status(400).send(err);
  }
});


/*

ENS DATA
Only stored in local cache

*/

let ensDomainCache = [];
let ensInfoCache = [];

const getEnsDomain = async function (addr) {
  console.log("Getting ENS data for " + addr);
  const now = new Date().getTime();
  let wasInCache = false;
  // See if it is cached
  for (const thisAddr of ensDomainCache) {
    if (thisAddr.address === addr) {
      // Check timeout
      if (now - thisAddr.timestamp < CONF_TIMEOUT_ENS_DOMAIN) {
        return thisAddr.domain;
      }
      wasInCache = true;
    }
  }
  // Else get it and cache it
  const ensDomain = await l1provider.lookupAddress(addr.toLowerCase());
  let ensObj;
  if (!ensDomain) {
    ensObj = {
      domain: null,
      address: addr,
      timestamp: now
    };
  } else {
    ensObj = {
      domain: ensDomain,
      address: addr,
      timestamp: now
    };
  }
  if (wasInCache) {
    for (var idx = 0; idx < ensDomainCache.length; idx++) {
      if (ensDomainCache[idx].address == addr) {
        console.log("Updating outdated domain " + ensObj.domain + " owned by " + ensObj.address + " @ " + ensObj.timestamp);
        ensDomainCache[idx] = ensObj;
        break;
      }
    }
  } else {
    console.log("Caching new domain " + ensObj.domain + " owned by " + ensObj.address + " @ " + ensObj.timestamp);
    ensDomainCache.push(ensObj);
  }
  return ensObj.domain;
}

const getEnsInfo = async function (addr) {
  console.log("Getting ENS info for " + addr);
  const now = new Date().getTime();
  let wasInCache = false;
  // See if it is cached
  for (const thisAddr of ensInfoCache) {
    if (thisAddr.domain === addr) {
      // Check timeout
      if (now - thisAddr.timestamp < CONF_TIMEOUT_ENS_INFO) {
        return thisAddr;
      }
      wasInCache = true;
    }
  }
  // Else get it and cache it
  const resolver = await l1provider.getResolver(addr);
  const description = await resolver.getText("description");
  const url = await resolver.getText("url");
  const avatar = await resolver.getAvatar();
  const ensObj = {
    domain: addr,
    description,
    url,
    avatar,
    timestamp: now
  };
  if (wasInCache) {
    for (var idx = 0; idx < ensInfoCache.length; idx++) {
      if (ensInfoCache[idx].domain == addr) {
        console.log("Updating outdated info " + ensObj.domain + " @ " + ensObj.timestamp);
        ensInfoCache[idx] = ensObj;
        break;
      }
    }
  } else {
    console.log("Caching new info " + ensObj.domain + " @ " + ensObj.timestamp);
    ensInfoCache.push(ensObj);
  }
  return ensObj;
}
// Gets and caches info for a single address
apiRouter.get("/getENS/:orch", async (req, res) => {
  try {
    // First resolve addr => domain name
    const ensDomain = await getEnsDomain(req.params.orch);
    if (!ensDomain) {
      res.send({ domain: null });
      return;
    }
    // Then resolve address to info
    const ensInfo = await getEnsInfo(ensDomain);
    res.send(ensInfo);
  } catch (err) {
    res.status(400).send(err);
  }
});
// Returns entire ENS domain mapping cache
apiRouter.get("/getEnsDomains", async (req, res) => {
  try {
    res.send(ensDomainCache);
  } catch (err) {
    res.status(400).send(err);
  }
});
// Returns entire ENS info mapping cache
apiRouter.get("/getEnsInfo", async (req, res) => {
  try {
    res.send(ensInfoCache);
  } catch (err) {
    res.status(400).send(err);
  }
});


/*

LEADERBOARD TEST SCORES
Elapsed test scores stored in mongoDB (monthlyStat.js) and all in local cache

*/

let orchScoreCache = [];

const mutateTestScoresToDB = async function (scoreObj, month, year) {
  const dateObj = new Date();
  const thisMonth = dateObj.getMonth();
  const thisYear = dateObj.getFullYear();
  // If the test stream result is not in the past, return immediately
  if (thisYear == year && thisMonth == month) {
    return;
  }
  // Immediately mutate Monthly statistics object
  const doc = await MonthlyStat.findOneAndUpdate({
    year: year,
    month: month
  }, {
    testScores: scoreObj
  }, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true
  });
}

const zeroPad = (num, places) => String(num).padStart(places, '0');
// Exports info on a given Orchestrator
apiRouter.post("/getOrchestratorScores", async (req, res) => {
  try {
    const { month, year } = req.body;
    if (month && year) {
      // Since months get counted starting at 0
      const now = new Date().getTime();
      let wasInCache = false;
      // See if it is cached
      for (const thisAddr of orchScoreCache) {
        if (thisAddr.year === year && thisAddr.month === month) {
          // Check timeout
          if (now - thisAddr.timestamp < 360000) {
            res.send(thisAddr);
            return;
          }
          wasInCache = true;
        }
      }
      // Calculate UTC timestamps for this month
      const fromString = year + '-' + zeroPad(month + 1, 2) + '-01T00:00:00.000Z';
      let endString;
      if (month > 11) {
        endString = (year + 1) + '-' + '01-01T00:00:00.000Z';
      } else {
        endString = year + '-' + zeroPad((month + 2), 2) + '-01T00:00:00.000Z';
      }
      const startTime = parseInt(Date.parse(fromString) / 1000);
      const endTime = parseInt(Date.parse(endString) / 1000)
      // Else get it and cache it
      const url = "https://leaderboard-serverless.vercel.app/api/aggregated_stats?since=" + startTime + "&until=" + endTime;
      console.log("Getting new Orchestrator scores for " + year + "-" + month + " @ " + url);

      https.get(url, (res2) => {
        let body = "";
        res2.on("data", (chunk) => {
          body += chunk;
        });
        res2.on("end", () => {
          try {
            const data = JSON.parse(body);
            const scoreObj = {
              timestamp: now,
              year: year,
              month: month,
              scores: data
            }
            if (wasInCache) {
              for (var idx = 0; idx < orchScoreCache.length; idx++) {
                if (orchScoreCache[idx].year == year && orchScoreCache[idx].month == month) {
                  console.log("Updating outdated orch score info " + year + "-" + month + " @ " + scoreObj.timestamp);
                  orchScoreCache[idx] = scoreObj;
                  break;
                }
              }
            } else {
              console.log("Caching new orch score info " + year + "-" + month + " @ " + scoreObj.timestamp);
              orchScoreCache.push(scoreObj);
            }
            // Also update monthly stats
            mutateTestScoresToDB(scoreObj, month, year);
            res.send(scoreObj);
          } catch (error) {
            console.error(error.message);
          };
        });
      }).on("error", (error) => {
        console.error(error.message);
      });
    } else {
      res.send({});
      return;
    }
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});
// Returns entire orch score mapping cache
apiRouter.get("/getAllOrchScores", async (req, res) => {
  try {
    res.send(orchScoreCache);
  } catch (err) {
    res.status(400).send(err);
  }
});


export default apiRouter;
