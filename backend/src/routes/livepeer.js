import express from "express";
import Event from '../models/event';
import Block from '../models/block';
const apiRouter = express.Router();
import {
  API_CMC, API_L1_HTTP, API_L2_HTTP, API_L2_WS, CONF_DEFAULT_ORCH
} from "../config";
// Do API requests to other API's
const https = require('https');
// Read ABI files
const fs = require('fs');
// Used for the livepeer thegraph API
import { request, gql } from 'graphql-request';
// Gets ETH, LPT and other coin info
const CoinMarketCap = require('coinmarketcap-api');
const cmcClient = new CoinMarketCap(API_CMC);
// Gets blockchain data
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
// Gets gas prices
const web3layer1 = createAlchemyWeb3(API_L1_HTTP);
const web3layer2 = createAlchemyWeb3(API_L2_HTTP);
// For listening to blockchain events
const web3layer2WS = createAlchemyWeb3(API_L2_WS);

// Update CoinMarketCap related api calls every 5 minutes
const timeoutCMC = 360000;
let cmcPriceGet = 0;
let ethPrice = 0;
let lptPrice = 0;
let cmcQuotes = {};
let cmcCache = {};

// Update Alchemy related API calls every 2 seconds
const timeoutAlchemy = 2000;
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

// Update O info from thegraph every 1 minute
const timeoutTheGraph = 60000;
// Will contain addr, lastGet, and obj of any requested O's
let orchestratorCache = [];

// Listen to smart contract emitters. Only re-syncs on boot!
let eventsCache = [];
let latestMissedDuringSync = 0;
let lastBlockDataAdded = 0;
let syncCache = [];
// Set to true to drop the entire collection on boot and get all events
const fullSync = false;
// https://arbiscan.io/address/0x35Bcf3c30594191d53231E4FF333E8A770453e40#events
const BondingManagerTargetJson = fs.readFileSync('src/abi/BondingManagerTarget.json');
const BondingManagerTargetAbi = JSON.parse(BondingManagerTargetJson);
const BondingManagerProxyAddr = "0x35Bcf3c30594191d53231E4FF333E8A770453e40";
const contractInstance = new web3layer2WS.eth.Contract(BondingManagerTargetAbi.abi, BondingManagerProxyAddr);

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
  const dbObj = new Block(blockObj);
  await dbObj.save();
  return thisBlock;
}

// If fullsync: drop collection on DB
if (fullSync) {
  console.log("dropping old data due to full synchronization");
  Event.collection.drop();
}
// Set special flag to make sure also get blocks that pass us by while we are syncing
let isSyncing = true;
let isSyncRunning = false;
// Start Listening for live updates
var BondingManagerProxyListener = contractInstance.events.allEvents(async (error, event) => {
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
      const dbObj = new Event(eventObj);
      await dbObj.save();
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

// Does the syncing
const doSync = function () {
  console.log("Starting sync process");
  isSyncRunning = true;
  // Then do a sync from last found until latest known
  contractInstance.getPastEvents("allEvents", { fromBlock: lastBlockDataAdded + 1, toBlock: 'latest' }, async (error, events) => {
    try {
      if (error) {
        throw error
      }
      let size = events.length;
      console.log("Parsing " + size + " events");
      for (const event of events) {
        if (event.blockNumber > lastBlockDataAdded) {
          lastBlockDataAdded = event.blockNumber;
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
        const dbObj = new Event(eventObj);
        await dbObj.save();
        eventsCache.push(eventObj);
      }
    }
    catch (err) {
      console.log("FATAL ERROR: ", err);
    }
    isSyncRunning = false;
  });
}
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const handleSync = async function () {
  // First collection -> cache
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
  // Then determine latest block number parsed based on collection
  for (var idx = 0; idx < eventsCache.length; idx++) {
    const thisBlock = eventsCache[idx];
    if (thisBlock.blockNumber > lastBlockDataAdded) {
      lastBlockDataAdded = thisBlock.blockNumber;
    }
  }
  // Get latest block in chain
  const latestBlock = await web3layer2.eth.getBlockNumber();
  if (latestBlock > latestMissedDuringSync) {
    latestMissedDuringSync = latestBlock;
  }
  console.log("Parsed up to block " + lastBlockDataAdded + " out of " + latestMissedDuringSync + " blocks");
  // Get all parsed blocks
  blockCache = await Block.find({}, {
    blockNumber: 1,
    blockTime: 1
  });
  console.log("Retrieved existing Blocks of size " + blockCache.length);
  doSync();
  while (isSyncRunning) {
    await sleep(1000);
    console.log("Parsed " + lastBlockDataAdded + " out of " + latestMissedDuringSync + " blocks");
  }
  while (syncCache.length) {
    const liveEvents = syncCache;
    syncCache = [];
    for (const eventObj of liveEvents) {
      console.log("Parsing event received while syncing");
      const dbObj = new Event(eventObj);
      await dbObj.save();
      eventsCache.push(eventObj);
    }
  }
  console.log('done syncing')
  isSyncing = false;
};
if (!isSyncRunning) {
  handleSync();
}

// Splits of raw CMC object into coin quote data
const parseCmc = async function () {
  try {
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
    if (now - arbGet > timeoutAlchemy) {
      await parseEthBlockchain();
      arbGet = now;
    }
    // Update coin prices once their data has expired
    if (now - cmcPriceGet > timeoutCMC) {
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
    if (now - cmcPriceGet > timeoutCMC) {
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
    if (now - arbGet > timeoutAlchemy) {
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
    if (now - cmcPriceGet > timeoutCMC) {
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

// Gets info on a given Orchestrator
const parseOrchestrator = async function (reqAddr) {
  reqAddr = reqAddr.toLowerCase();
  const now = new Date().getTime();
  // Default assume it's the first time we request this Orchestrator
  let wasCached = false;
  let needsUpdate = true;
  let orchestratorObj = {};
  // First get cached object
  for (var orch of orchestratorCache) {
    if (orch.addr == reqAddr) {
      wasCached = true;
      orchestratorObj = orch;
      break;
    }
  }
  if (wasCached) {
    if (now - orch.lastGet < timeoutTheGraph) {
      needsUpdate = false;
    }
  }
  if (!wasCached || needsUpdate) {
    const orchQuery = gql`{
    transcoders(where: {id: "${reqAddr}"}) {
        activationRound
        deactivationRound
        active
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
        delegators {
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
    orchestratorObj = JSON.stringify(await request("https://api.thegraph.com/subgraphs/name/livepeer/arbitrum-one", orchQuery));
    if (wasCached) {
      for (var orch of orchestratorCache) {
        if (orch.addr == requestedOrchestrator) {
          orch = orchestratorObj;
          break;
        }
      }
    } else {
      orchestratorCache.push(orchestratorObj);
    }
  }
  return orchestratorObj;
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
    res.status(400).send(err);
  }
});
apiRouter.get("/getOrchestrator/:orch", async (req, res) => {
  try {
    const reqObj = await parseOrchestrator(req.params.orch);
    res.send(reqObj);
  } catch (err) {
    res.status(400).send(err);
  }
});
apiRouter.post("/getOrchestrator", async (req, res) => {
  try {
    const reqObj = await parseOrchestrator(req.body.orchAddr);
    res.send(reqObj);
  } catch (err) {
    res.status(400).send(err);
  }
});

export default apiRouter;