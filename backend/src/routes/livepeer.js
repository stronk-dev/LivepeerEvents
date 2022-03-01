import express from "express";
import Event from '../models/event';
const fs = require('fs');
const apiRouter = express.Router();
import {
  API_CMC, API_L1_HTTP, API_L2_HTTP, API_L2_WS
} from "../config";

// Get ETH price & LPT coin prices
const CoinMarketCap = require('coinmarketcap-api');
const cmcClient = new CoinMarketCap(API_CMC);
// Get gas price on ETH (L2 already gets exported by the O's themselves)
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3layer1 = createAlchemyWeb3(API_L1_HTTP);
const web3layer2 = createAlchemyWeb3(API_L2_HTTP);
const web3layer2WS = createAlchemyWeb3(API_L2_WS);

// Update CMC related api calls every 5 minutes
const timeoutCMC = 300000;
let cmcPriceGet = 0;
let ethPrice = 0;
let lptPrice = 0;
let cmcQuotes = {};
let cmcCache = {};

// Update alchemy related API calls every 2 seconds
const timeoutAlchemy = 2000;
let l2Gwei = 0;
let l1Gwei = 0;
let l2block = 0;
let l1block = 0;
let arbGet = 0;

// Gas limits on common contract interactions
const redeemRewardGwei = 1053687;
const claimTicketGwei = 1333043;
const withdrawFeeGwei = 688913;
let redeemRewardCostL1 = 0;
let redeemRewardCostL2 = 0;
let claimTicketCostL1 = 0;
let claimTicketCostL2 = 0;
let withdrawFeeCostL1 = 0;
let withdrawFeeCostL2 = 0;


// Listen to smart contract emitters. Resync with DB every 5 minutes
const timeoutEvents = 300000;
let eventsCache = [];
let eventsGet = 0;
// https://arbiscan.io/address/0x35Bcf3c30594191d53231E4FF333E8A770453e40#events
const BondingManagerTargetJson = fs.readFileSync('src/abi/BondingManagerTarget.json');
const BondingManagerTargetAbi = JSON.parse(BondingManagerTargetJson);
const BondingManagerProxyAddr = "0x35Bcf3c30594191d53231E4FF333E8A770453e40";
const contractInstance = new web3layer2WS.eth.Contract(BondingManagerTargetAbi.abi, BondingManagerProxyAddr);
var BondingManagerProxyListener = contractInstance.events.allEvents(async (error, event) => {
  try {
    if (error) {
      throw error
    }
    console.log('New event emitted on', BondingManagerProxyAddr);
    // Push obj of event to cache and create a new entry for it in the DB
    const eventObj = {
      address: event.address,
      transactionHash: event.transactionHash,
      transactionUrl: "https://arbiscan.io/tx/" + event.transactionHash,
      name: event.event,
      data: event.returnValues
    }
    const dbObj = new Event(eventObj);
    await dbObj.save();
    eventsCache.push(eventObj);
  }
  catch (err) {
    console.log("FATAL ERROR: ", err);
  }
});
console.log("listening for events on", BondingManagerProxyAddr)

// Splits of the big CMC object into separate datas
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

// Queries Alchemy for block info and fees
const parseL1Blockchain = async function () {
  const l1Wei = await web3layer1.eth.getGasPrice();
  l1block = await web3layer1.eth.getBlockNumber();
  l1Gwei = l1Wei / 1000000000;
  redeemRewardCostL1 = (redeemRewardGwei * l1Gwei) / 1000000000;
  claimTicketCostL1 = (claimTicketGwei * l1Gwei) / 1000000000;
  withdrawFeeCostL1 = (withdrawFeeGwei * l1Gwei) / 1000000000;
}
const parseL2Blockchain = async function () {
  const l2Wei = await web3layer2.eth.getGasPrice();
  l2block = await web3layer2.eth.getBlockNumber();
  l2Gwei = l2Wei / 1000000000;
  redeemRewardCostL2 = (redeemRewardGwei * l2Gwei) / 1000000000;
  claimTicketCostL2 = (claimTicketGwei * l2Gwei) / 1000000000;
  withdrawFeeCostL2 = (withdrawFeeGwei * l2Gwei) / 1000000000;
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
      quotes: cmcQuotes
    });
  } catch (err) {
    res.status(400).send(err);
  }
});

apiRouter.get("/cmc", async (req, res) => {
  try {
    const now = new Date().getTime();
    // Update cmc once their data has expired
    if (now - cmcPriceGet > timeoutCMC) {
      await parseCmc();
      cmcPriceGet = now;
    }
    res.send(cmcCache);
  } catch (err) {
    res.status(400).send(err);
  }
});

apiRouter.get("/blockchains", async (req, res) => {
  try {
    const now = new Date().getTime();
    // Update blockchain data if the cached data has expired
    if (now - arbGet > timeoutAlchemy) {
      await parseEthBlockchain();
      arbGet = now;
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
      withdrawFeeCostL2
    });
  } catch (err) {
    res.status(400).send(err);
  }
});


apiRouter.get("/quotes", async (req, res) => {
  try {
    const now = new Date().getTime();
    // Update cmc once their data has expired
    if (now - cmcPriceGet > timeoutCMC) {
      cmcCache = await cmcClient.getTickers({ limit: 200 });
      await parseCmc();
      cmcPriceGet = now;
    }
    res.send(cmcQuotes);
  } catch (err) {
    res.status(400).send(err);
  }
});

apiRouter.get("/getEvents", async (req, res) => {
  try {
    const now = new Date().getTime();
    // Update cmc once their data has expired
    if (now - eventsGet > timeoutEvents) {
      eventsCache = await Event.find({}, {
        address: 1,
        transactionHash: 1,
        transactionUrl: 1,
        name: 1,
        data: 1,
        _id: 0});
        eventsGet = now;
    }
    res.send(eventsCache);
  } catch (err) {
    res.status(400).send(err);
  }
});

export default apiRouter;