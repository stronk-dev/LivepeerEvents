import express from "express";
import Event from '../models/event';
import Block from '../models/block';
import Ticket from '../models/ticketEvent'

const apiRouter = express.Router();
import {
  API_CMC, API_L1_HTTP, API_L2_HTTP, API_L2_WS,
  CONF_DEFAULT_ORCH, CONF_SIMPLE_MODE, CONF_TIMEOUT_CMC,
  CONF_TIMEOUT_ALCHEMY, CONF_TIMEOUT_LIVEPEER, CONF_DISABLE_SYNC,
  CONF_DISABLE_DB, CONF_DISABLE_CMC, CONF_TIMEOUT_ENS_DOMAIN,
  CONF_TIMEOUT_ENS_INFO, CONF_DISABLE_ENS
} from "../config";

// Do API requests to other API's
const https = require('https');
// Read ABI files
const fs = require('fs');
// Used for the livepeer thegraph API
import { request, gql } from 'graphql-request';
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
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
// Gets gas prices
const web3layer1 = createAlchemyWeb3(API_L1_HTTP);
const web3layer2 = createAlchemyWeb3(API_L2_HTTP);

let web3layer2WS;
// Skip if running in basic mode
if (!CONF_SIMPLE_MODE) {
  web3layer2WS = createAlchemyWeb3(API_L2_WS);
}
// For listening to blockchain events

// ENS stuff TODO: CONF_DISABLE_ENS
const { ethers } = require("ethers");
const provider = new ethers.providers.JsonRpcProvider(API_L1_HTTP);
// const ens = new ENS({ provider: web3layer1, ensAddress: getEnsAddress('1') });
let ensDomainCache = [];
let ensInfoCache = [];
let threeboxCache = [];

// Update CoinMarketCap related api calls every 5 minutes
let cmcPriceGet = 0;
let ethPrice = 0;
let lptPrice = 0;
let cmcQuotes = {};
let cmcCache = {};

// Update Alchemy related API calls every 2 seconds
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

// Will contain addr, lastGet, and obj of any requested O's
let orchestratorCache = [];
// Contains delegator addr and the address of the O they are bounded to
let delegatorCache = [];
// Will contain scores for a given year and month
let orchScoreCache = [];

// Listen to smart contract emitters. Only re-syncs on boot!
let eventsCache = [];
let latestBlockInChain = 0;
let lastBlockEvents = 0;
let lastBlockTickets = 0;
let syncCache = [];
let ticketsCache = [];
let ticketsSyncCache = [];
// https://arbiscan.io/address/0x35Bcf3c30594191d53231E4FF333E8A770453e40#events
let BondingManagerTargetJson;
let BondingManagerTargetAbi;
let BondingManagerProxyAddr;
let bondingManagerContract;
let TicketBrokerTargetJson;
let TicketBrokerTargetAbi;
let TicketBrokerTargetAddr;
let ticketBrokerContract;
if (!CONF_SIMPLE_MODE) {
  // Listen for events on the bonding manager contract
  BondingManagerTargetJson = fs.readFileSync('src/abi/BondingManagerTarget.json');
  BondingManagerTargetAbi = JSON.parse(BondingManagerTargetJson);
  BondingManagerProxyAddr = "0x35Bcf3c30594191d53231E4FF333E8A770453e40";
  bondingManagerContract = new web3layer2WS.eth.Contract(BondingManagerTargetAbi.abi, BondingManagerProxyAddr);
  // Listen for events on the ticket broker contract
  TicketBrokerTargetJson = fs.readFileSync('src/abi/TicketBrokerTarget.json');
  TicketBrokerTargetAbi = JSON.parse(TicketBrokerTargetJson);
  TicketBrokerTargetAddr = "0xa8bB618B1520E284046F3dFc448851A1Ff26e41B";
  ticketBrokerContract = new web3layer2WS.eth.Contract(TicketBrokerTargetAbi.abi, TicketBrokerTargetAddr);
}

let blockCache = [];
const getBlock = async function (blockNumber) {
  // See if it is cached
  for (const thisBlock of blockCache) {
    if (thisBlock.number === blockNumber) {
      return thisBlock;
    }
  }
  // Else get it and cache it
  const thisBlock = await web3layer2.eth.getBlock(blockNumber);
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

// Set special flag to make sure also get blocks that pass us by while we are syncing
let isSyncing = true;
let isEventSyncing = false;
let isTicketSyncing = false;
// Start Listening for live updates
var BondingManagerProxyListener;
var TicketBrokerProxyListener;
if (!CONF_SIMPLE_MODE) {
  BondingManagerProxyListener = bondingManagerContract.events.allEvents(async (error, event) => {
    try {
      if (error) {
        throw error
      }
      if (isSyncing) {
        console.log('Received new Event on block ' + event.blockNumber + " during sync");
      } else {
        console.log('Received new Event on block ' + event.blockNumber);
      }
      const thisBlock = await getBlock(event.blockNumber);
      // Push obj of event to cache and create a new entry for it in the DB
      const eventObj = {
        address: event.address,
        transactionHash: event.transactionHash,
        transactionUrl: "https://arbiscan.io/tx/" + event.transactionHash,
        name: event.event,
        data: event.returnValues,
        blockNumber: thisBlock.number,
        blockTime: thisBlock.timestamp
      }
      if (!isSyncing) {
        if (!CONF_DISABLE_DB) {
          const dbObj = new Event(eventObj);
          await dbObj.save();
        }
        eventsCache.push(eventObj);
      } else {
        syncCache.push(eventObj);
      }
    }
    catch (err) {
      console.log("FATAL ERROR: ", err);
    }
  });
  console.log("Listening for events on " + BondingManagerProxyAddr);
  TicketBrokerProxyListener = ticketBrokerContract.events.allEvents(async (error, event) => {
    try {
      if (error) {
        throw error
      }
      if (isSyncing) {
        console.log('Received new ticket event on block ' + event.blockNumber + " during sync");
      } else {
        console.log('Received new ticket event on block ' + event.blockNumber);
      }
      const thisBlock = await getBlock(event.blockNumber);
      // Push obj of event to cache and create a new entry for it in the DB
      const eventObj = {
        address: event.address,
        transactionHash: event.transactionHash,
        transactionUrl: "https://arbiscan.io/tx/" + event.transactionHash,
        name: event.event,
        data: event.returnValues,
        blockNumber: thisBlock.number,
        blockTime: thisBlock.timestamp
      }
      if (!isSyncing) {
        if (!CONF_DISABLE_DB) {
          const dbObj = new Ticket(eventObj);
          await dbObj.save();
        }
        ticketsCache.push(eventObj);
      } else {
        ticketsSyncCache.push(eventObj);
      }
    }
    catch (err) {
      console.log("FATAL ERROR: ", err);
    }
  });
  console.log("Listening for tickets on " + TicketBrokerTargetAddr);
}

// Syncs events database
const syncEvents = function () {
  console.log("Starting sync process for Bonding Manager events");
  isEventSyncing = true;
  // Then do a sync from last found until latest known
  bondingManagerContract.getPastEvents("allEvents", { fromBlock: lastBlockEvents + 1, toBlock: 'latest' }, async (error, events) => {
    try {
      if (error) {
        throw error
      }
      let size = events.length;
      console.log("Parsing " + size + " events");
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
      }
    }
    catch (err) {
      console.log("FATAL ERROR: ", err);
    }
    isEventSyncing = false;
  });
}
// Syncs tickets database
const syncTickets = function () {
  console.log("Starting sync process for Ticket Broker events");
  isTicketSyncing = true;
  // Then do a sync from last found until latest known
  ticketBrokerContract.getPastEvents("allEvents", { fromBlock: lastBlockTickets + 1, toBlock: 'latest' }, async (error, events) => {
    try {
      if (error) {
        throw error
      }
      let size = events.length;
      console.log("Parsing " + size + " tickets");
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
      }
    }
    catch (err) {
      console.log("FATAL ERROR: ", err);
    }
    isTicketSyncing = false;
  });
}
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const handleSync = async function () {
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
  console.log("Retrieved existing Events of size " + eventsCache.length);
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
  console.log("Retrieved existing Tickets of size " + ticketsCache.length);
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
  // Get latest block in chain
  const latestBlock = await web3layer2.eth.getBlockNumber();
  if (latestBlock > latestBlockInChain) {
    latestBlockInChain = latestBlock;
  }
  console.log("Latest L2 Eth block is " + latestBlockInChain);
  console.log("Needs to sync " + (latestBlockInChain - lastBlockEvents) + " blocks for Events sync");
  console.log("Needs to sync " + (latestBlockInChain - lastBlockTickets) + " blocks for Tickets sync");
  syncTickets();
  syncEvents();
  while (isEventSyncing || isTicketSyncing) {
    await sleep(3000);
    if (isEventSyncing) {
      console.log("Parsed " + lastBlockEvents + " out of " + latestBlockInChain + " blocks for Event sync");
    }
    if (isTicketSyncing) {
      console.log("Parsed " + lastBlockTickets + " out of " + latestBlockInChain + " blocks for Ticket sync");
    }
  }
  while (syncCache.length || ticketsSyncCache.length) {
    const liveEvents = syncCache;
    syncCache = [];
    for (const eventObj of liveEvents) {
      console.log("Parsing event received while syncing");
      if (!CONF_DISABLE_DB) {
        const dbObj = new Event(eventObj);
        await dbObj.save();
      }
      eventsCache.push(eventObj);
    }
    const liveTickets = ticketsSyncCache;
    ticketsSyncCache = [];
    for (const eventObj of liveTickets) {
      console.log("Parsing ticket received while syncing");
      if (!CONF_DISABLE_DB) {
        const dbObj = new Ticket(eventObj);
        await dbObj.save();
      }
      ticketsCache.push(eventObj);
    }
  }
  console.log('done syncing')
  isSyncing = false;
};
if (!isEventSyncing && !CONF_SIMPLE_MODE && !CONF_DISABLE_SYNC) {
  handleSync();
}

// Splits of raw CMC object into coin quote data
const parseCmc = async function () {
  try {
    if (!cmcEnabled) {
      return;
    }
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

// Queries Alchemy for block info and gas fees
const parseL1Blockchain = async function () {
  const l1Wei = await web3layer1.eth.getGasPrice();
  l1block = await web3layer1.eth.getBlockNumber();
  l1Gwei = l1Wei / 1000000000;
  redeemRewardCostL1 = (redeemRewardGwei * l1Gwei) / 1000000000;
  claimTicketCostL1 = (claimTicketGwei * l1Gwei) / 1000000000;
  withdrawFeeCostL1 = (withdrawFeeGwei * l1Gwei) / 1000000000;
  stakeFeeCostL1 = (stakeFeeGwei * l1Gwei) / 1000000000;
  commissionFeeCostL1 = (commissionFeeGwei * l1Gwei) / 1000000000;
  serviceUriFeeCostL1 = (serviceUriFee * l1Gwei) / 1000000000;
}
const parseL2Blockchain = async function () {
  const l2Wei = await web3layer2.eth.getGasPrice();
  l2block = await web3layer2.eth.getBlockNumber();
  l2Gwei = l2Wei / 1000000000;
  redeemRewardCostL2 = (redeemRewardGwei * l2Gwei) / 1000000000;
  claimTicketCostL2 = (claimTicketGwei * l2Gwei) / 1000000000;
  withdrawFeeCostL2 = (withdrawFeeGwei * l2Gwei) / 1000000000;
  stakeFeeCostL2 = (stakeFeeGwei * l2Gwei) / 1000000000;
  commissionFeeCostL2 = (commissionFeeGwei * l2Gwei) / 1000000000;
  serviceUriFeeCostL2 = (serviceUriFee * l2Gwei) / 1000000000;
}
const parseEthBlockchain = async function () {
  await Promise.all([parseL1Blockchain(), parseL2Blockchain()]);
}

// Export livepeer and eth coin prices and L1 Eth gas price
apiRouter.get("/grafana", async (req, res) => {
  try {
    const now = new Date().getTime();
    // Update blockchain data if the cached data has expired
    if (now - arbGet > CONF_TIMEOUT_ALCHEMY) {
      await parseEthBlockchain();
      arbGet = now;
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
      quotes: cmcQuotes
    });
  } catch (err) {
    res.status(400).send(err);
  }
});

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

// Exports list of smart contract events
apiRouter.get("/getEvents", async (req, res) => {
  try {
    res.send(eventsCache);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Exports list of smart contract ticket events
apiRouter.get("/getTickets", async (req, res) => {
  try {
    res.send(ticketsCache);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Gets info on a given Orchestrator
const parseOrchestrator = async function (reqAddr) {
  try {
    reqAddr = reqAddr.toLowerCase();
    const now = new Date().getTime();
    // Default assume it's the first time we request this Orchestrator
    let wasCached = false;
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
        pendingFeeShare
        pendingRewardCut
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
        return {};
      }
      orchestratorObj.lastGet = now;
      if (wasCached) {
        for (var idx = 0; idx < orchestratorCache.length; idx++) {
          if (orchestratorCache[idx].id == reqAddr) {
            console.log("Updating outdated orchestrator " + orchestratorObj.id + " @ " + now);
            orchestratorCache[idx] = orchestratorObj;
            break;
          }
        }
      } else {
        console.log("Pushing new orchestrator " + orchestratorObj.id + " @ " + now);
        orchestratorCache.push(orchestratorObj);
      }
    }
    return orchestratorObj;
  } catch (err) {
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


// Gets info on a given Delegator
const parseDelegator = async function (reqAddr) {
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


// Export livepeer and eth coin prices and L1 Eth gas price
apiRouter.get("/prometheus/:orchAddr", async (req, res) => {
  try {
    const now = new Date().getTime();
    // Update blockchain data if the cached data has expired
    if (now - arbGet > CONF_TIMEOUT_ALCHEMY) {
      await parseEthBlockchain();
      arbGet = now;
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

const getEnsDomain = async function (addr) {
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
  const ensDomain = await provider.lookupAddress(addr.toLowerCase());
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
  const resolver = await provider.getResolver(addr);
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


const getThreeBoxInfo = async function (addr) {
  const now = new Date().getTime();
  let wasInCache = false;
  // See if it is cached
  for (const thisAddr of threeboxCache) {
    if (thisAddr.address === addr) {
      // Check timeout
      if (now - thisAddr.timestamp < CONF_TIMEOUT_ENS_INFO) {
        return thisAddr;
      }
      wasInCache = true;
    }
  }
  // Else get it and cache it
  const url = "https://explorer.livepeer.org/api/3box?account=" + addr;
  await https.get(url, (res) => {
    let body = "";
    res.on("data", (chunk) => {
      body += chunk;
    });
    res.on("end", () => {
      try {
        const data = JSON.parse(body);
        const threeBoxObj = {
          address: data.id,
          name: data.name,
          website: data.website,
          description: data.description,
          image: data.image,
          timestamp: now
        }
        if (wasInCache) {
          for (var idx = 0; idx < threeboxCache.length; idx++) {
            if (threeboxCache[idx].address == addr) {
              console.log("Updating outdated 3box info " + threeBoxObj.address + " @ " + threeBoxObj.timestamp);
              threeboxCache[idx] = threeBoxObj;
              break;
            }
          }
        } else {
          console.log("Caching new 3box info " + threeBoxObj.address + " @ " + threeBoxObj.timestamp);
          threeboxCache.push(threeBoxObj);
        }
      } catch (error) {
        console.error(error.message);
      };
    });
  }).on("error", (error) => {
    console.error(error.message);
  });
}
// Gets and caches info for a single address
apiRouter.get("/getThreeBox/:orch", async (req, res) => {
  try {
    // First resolve addr => domain name
    const threeBoxInfo = await getThreeBoxInfo(req.params.orch);
    res.send(threeBoxInfo);
  } catch (err) {
    res.status(400).send(err);
  }
});
// Returns entire 3box info mapping cache
apiRouter.get("/getAllThreeBox", async (req, res) => {
  try {
    res.send(threeboxCache);
  } catch (err) {
    res.status(400).send(err);
  }
});


const zeroPad = (num, places) => String(num).padStart(places, '0')
const getScoreAtMonthYear = async function (month, year) {
  const now = new Date().getTime();
  let wasInCache = false;
  // See if it is cached
  for (const thisAddr of orchScoreCache) {
    if (thisAddr.year === year && thisAddr.month === month) {
      // Check timeout
      if (now - thisAddr.timestamp < 360000) {
        return thisAddr;
      }
      wasInCache = true;
    }
  }
  // Calculate UTC timestamps for this month
  const fromString = year + '-' + zeroPad(month, 2) + '-01T00:00:00.000Z';
  let endString;
  if (month > 10) {
    endString = year + '-' + zeroPad((month + 1), 2) + '-01T00:00:00.000Z';
  } else {
    endString = (year + 1) + '-' + zeroPad(0, 2) + '-01T00:00:00.000Z';
  }
  const startTime = parseInt(Date.parse(fromString) / 1000);
  const endTime = parseInt(Date.parse(endString) / 1000)
  // Else get it and cache it
  const url = "https://leaderboard-serverless.vercel.app/api/aggregated_stats?since=" + startTime + "&to=" + endTime;
  await https.get(url, (res) => {
    let body = "";
    res.on("data", (chunk) => {
      body += chunk;
    });
    res.on("end", () => {
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
      } catch (error) {
        console.error(error.message);
      };
    });
  }).on("error", (error) => {
    console.error(error.message);
  });
}

// Exports info on a given Orchestrator
apiRouter.post("/getOrchestratorScores", async (req, res) => {
  try {
    const { month, year } = req.body;
    if (month && year) {
      const reqObj = await getScoreAtMonthYear(month, year);
      res.send(reqObj);
      return;
    }
    res.send({});
    return;
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