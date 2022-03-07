import * as apiUtil from "../util/livepeer";
import { receiveErrors } from "./error";

const activationColour = "rgba(23, 60, 122, 0.3)";
const rewardColour = "rgba(20, 99, 29, 0.3)";
const updateColour = "rgba(122, 63, 23, 0.3)";
const withdrawStakeColour = "rgba(115, 110, 22, 0.3)";
const stakeColour = "rgba(56, 23, 122, 0.3)";
const unbondColour = "rgba(122, 23, 51, 0.3)";
const claimColour = "rgba(77, 91, 42, 0.3)";

const thresholdStaking = 0.001;
const thresholdFees = 0.00009;

export const RECEIVE_QUOTES = "RECEIVE_QUOTES";
export const RECEIVE_BLOCKCHAIN_DATA = "RECEIVE_BLOCKCHAIN_DATA";
export const RECEIVE_EVENTS = "RECEIVE_EVENTS";
export const RECEIVE_CURRENT_ORCHESTRATOR = "RECEIVE_CURRENT_ORCHESTRATOR";
export const RECEIVE_ORCHESTRATOR = "RECEIVE_ORCHESTRATOR";

const setQuotes = message => ({
  type: RECEIVE_QUOTES, message
});
const setBlockchainData = message => ({
  type: RECEIVE_BLOCKCHAIN_DATA, message
});
const setEvents = message => ({
  type: RECEIVE_EVENTS, message
});
const setCurrentOrchestratorInfo = message => ({
  type: RECEIVE_CURRENT_ORCHESTRATOR, message
});
const setOrchestratorInfo = message => ({
  type: RECEIVE_ORCHESTRATOR, message
});

export const getQuotes = () => async dispatch => {
  const response = await apiUtil.getQuotes();
  const data = await response.json();
  if (response.ok) {
    return dispatch(setQuotes(data));
  }
  return dispatch(receiveErrors(data));
};

export const getBlockchainData = () => async dispatch => {
  const response = await apiUtil.getBlockchainData();
  const data = await response.json();
  if (response.ok) {
    return dispatch(setBlockchainData(data));
  }
  return dispatch(receiveErrors(data));
};

export const getEvents = () => async dispatch => {
  const response = await apiUtil.getEvents();
  const data = await response.json();
  // Combine raw list of events into a list of useful Events
  if (response.ok) {
    let finalEventList = [];
    // Current transaction we are processing
    let txCounter = 0;
    let currentTx = "";
    let currentUrl = "";
    let currentBlock = 0;
    let currentTime = 0;
    // Current Event we are processing
    let eventType = "";             // Named type: Withdraw, Update, Claim, Reward, Activate, Unbond, Stake
    let eventDescription = "";      // Descriptive text, also containing Amount, AmountOther and When
    let eventCaller = "";           // address we will display on the left side
    let eventFrom = "";             // address from which X gets taken
    let eventTo = "";               // address to which X gets sent
    let eventColour = "rgba(255,255,255,0.5)";
    let eventContainsBond = false;
    let eventContainsTranscoderActivated = false;
    let eventContainsUnbond = false;
    let eventContainsRebond = false;
    let eventContainsTransferBond = false;
    let eventContainsTranscoderUpdate = false;
    let eventContainsEarningsClaimed = false;
    let eventContainsReward = false;
    // Temp vars for the current Event we are processing
    let tmpAmount = 0;
    let tmpAmountOther = "";
    let tmpWhen = "";
    // Group Events into transactions. Always reset when the transactionID changes
    {
      for (const eventObj of data.slice(0).reverse()) {
        if (currentTx === "") {
          currentTx = eventObj.transactionHash;
          currentUrl = eventObj.transactionUrl;
          currentBlock = eventObj.blockNumber;
          currentTime = eventObj.blockTime;
        }
        // New transaction found
        if (currentTx !== eventObj.transactionHash) {
          // Unbond <> TransferBond <> (eventContainsEarningsClaimed) <> Rebond => Stake Event
          if (eventContainsUnbond && eventContainsTransferBond && eventContainsRebond) {
            eventType = "Stake";
            eventColour = stakeColour;
          }
          // (Bond <>) TranscoderActivated => Activate Event
          else if (eventContainsTranscoderActivated) {
            eventType = "Activate";
            eventColour = activationColour;
            eventFrom = "";
            eventTo = "";
            if (eventContainsBond) {
              eventDescription = "activated with a self stake of " + tmpAmount.toFixed(2) + " LPT and will become active in round " + tmpWhen;
            } else {
              eventDescription = "reactivated and will become active in round " + tmpWhen;
            }
          }
          // Lone Unbond => Unbond Event
          else if (eventContainsUnbond) {
            eventType = "Unbond";
            eventColour = unbondColour;
            eventDescription = "unbonded " + tmpAmount.toFixed(2) + " LPT starting from round " + tmpWhen;

          }
          // Lone Bond => Stake Event
          else if (eventContainsBond) {
            eventType = "Stake";
            eventColour = stakeColour;
          }
          // Lone Rebond => Stake Event
          else if (eventContainsRebond) {
            eventType = "Stake";
            eventColour = stakeColour;
            eventDescription = "increased their stake to " + tmpAmount.toFixed(2) + " LPT at";
          }

          // Fill description of Stake Event if it wasn't set yet
          if (eventType === "Stake" && eventDescription === "") {
            if (eventFrom === "0x0000000000000000000000000000000000000000") {
              eventDescription = "staked " + tmpAmount.toFixed(2) + " LPT";
            } else if (eventFrom === eventTo) {
              eventFrom = "";
              eventDescription = "increased their stake to " + tmpAmount.toFixed(2) + " LPT";
            } else {
              eventDescription = "moved a " + tmpAmount.toFixed(2) + " LPT stake";
            }
          }
          // If we have an eventType at this point, we have a completed Event from the previous transaction
          if (eventType !== "") {
            finalEventList.push({
              eventType,
              eventDescription,
              eventCaller,
              eventFrom,
              eventTo,
              eventColour,
              transactionHash: currentTx,
              transactionUrl: currentUrl,
              transactionBlock: currentBlock,
              transactionTime: currentTime,
              eventValue: (tmpAmount > tmpAmountOther) ? tmpAmount : tmpAmountOther
            });
          }

          // Reset event data
          eventType = "";
          eventDescription = "";
          eventCaller = "";
          eventFrom = "";
          eventTo = "";
          eventColour = "";
          tmpAmount = 0;
          tmpAmountOther = "";
          tmpWhen = "";
          eventContainsBond = false;
          eventContainsTranscoderActivated = false;
          eventContainsUnbond = false;
          eventContainsRebond = false;
          eventContainsTransferBond = false;
          eventContainsTranscoderUpdate = false;
          eventContainsEarningsClaimed = false;
          eventContainsReward = false;
          txCounter++;
          currentTx = eventObj.transactionHash;
          currentUrl = eventObj.transactionUrl;
          currentBlock = eventObj.blockNumber;
          currentTime = eventObj.blockTime;
        }
        // Always split off WithdrawStake as a separate Withdraw Event
        if (eventObj.name === "WithdrawStake") {
          const amount = parseFloat(eventObj.data.amount) / 1000000000000000000;
          if (amount < thresholdFees) {
            continue;
          }
          const txt = " withdrew a " + amount.toFixed(2) + " LPT stake in round " + eventObj.data.withdrawRound;
          finalEventList.push({
            eventType: "Withdraw",
            eventDescription: txt,
            eventCaller: eventObj.data.delegator.toLowerCase(),
            eventFrom: "",
            eventTo: "",
            eventColour: withdrawStakeColour,
            transactionHash: currentTx,
            transactionUrl: currentUrl,
            transactionBlock: currentBlock,
            transactionTime: currentTime,
            eventValue: amount 
          });
        } else if (eventObj.name === "WithdrawFees") {
          const amount = parseFloat(eventObj.data.amount) / 1000000000000000000;
          if (amount < thresholdFees) {
            continue;
          }
          const txt = " withdrew " + amount.toFixed(2) + " LPT earned fees";
          finalEventList.push({
            eventType: "Withdraw",
            eventDescription: txt,
            eventCaller: eventObj.data.delegator.toLowerCase(),
            eventFrom: eventObj.data.delegator.toLowerCase(),
            eventTo: "",
            eventColour: withdrawStakeColour,
            transactionHash: currentTx,
            transactionUrl: currentUrl,
            transactionBlock: currentBlock,
            transactionTime: currentTime,
            eventValue: amount
          });
        }
        // Always split off TranscoderUpdate as a separate Update Event
        else if (eventObj.name === "TranscoderUpdate") {
          eventContainsTranscoderUpdate = true;
          const amount1 = parseFloat(eventObj.data.rewardCut) / 10000;
          const amount2 = 100 - (eventObj.data.feeShare / 10000);
          const txt = "changed their reward commission to " + amount1.toFixed(2) + "% and their fee commission to " + amount2.toFixed(2) + "%";
          finalEventList.push({
            eventType: "Update",
            eventDescription: txt,
            eventCaller: eventObj.data.transcoder.toLowerCase(),
            eventFrom: "",
            eventTo: "",
            eventColour: updateColour,
            transactionHash: currentTx,
            transactionUrl: currentUrl,
            transactionBlock: currentBlock,
            transactionTime: currentTime,
            eventValue: (amount1 > amount2) ? amount1 : amount2
          });
        }
        // Always split off EarningsClaimed as a separate Claim Event
        else if (eventObj.name === "EarningsClaimed") {
          eventContainsEarningsClaimed = true;
          const amount1 = parseFloat(eventObj.data.rewards) / 1000000000000000000;
          const amount2 = parseFloat(eventObj.data.fees) / 1000000000000000000;
          if (amount1 < thresholdStaking && amount2 < thresholdFees) {
            continue;
          }
          let txt = "delegator claimed ";
          if (amount1 > thresholdStaking) {
            txt += amount1.toFixed(2) + " LPT staking rewards";
            if (amount2 > thresholdFees) {
              txt += " and "
            }
          }
          if (amount2 > thresholdFees) {
            txt += amount2.toFixed(4) + " Eth fee rewards";
          }
          txt += " from rounds " + eventObj.data.startRound + " to " + eventObj.data.endRound;
          finalEventList.push({
            eventType: "Claim",
            eventDescription: txt,
            eventCaller: eventObj.data.delegator.toLowerCase(),
            eventFrom: eventObj.data.delegate.toLowerCase(),
            eventTo: "",
            eventColour: claimColour,
            transactionHash: currentTx,
            transactionUrl: currentUrl,
            transactionBlock: currentBlock,
            transactionTime: currentTime,
            eventValue: (amount1 > amount2) ? amount1 : amount2
          });
        }
        // Always split off Reward as a separate Reward Event
        else if (eventObj.name === "Reward") {
          eventContainsReward = true;
          const amount1 = parseFloat(eventObj.data.amount) / 1000000000000000000;
          let txt = "called reward worth " + amount1.toFixed(2) + " LPT";
          if (Math.floor(amount1) == 69) {
            txt += "... Nice!";
          }
          finalEventList.push({
            eventType: "Reward",
            eventDescription: txt,
            eventCaller: eventObj.data.transcoder.toLowerCase(),
            eventFrom: "",
            eventTo: "",
            eventColour: rewardColour,
            transactionHash: currentTx,
            transactionUrl: currentUrl,
            transactionBlock: currentBlock,
            transactionTime: currentTime,
            eventValue: amount1
          });
        }
        // Extract useful info from other types of Event
        else if (eventObj.name === "Bond") {
          eventContainsBond = true;
          eventCaller = eventObj.data.delegator.toLowerCase();
          eventFrom = eventObj.data.oldDelegate.toLowerCase();
          eventTo = eventObj.data.newDelegate.toLowerCase();
          tmpAmount = parseFloat(eventObj.data.bondedAmount) / 1000000000000000000;
          tmpAmountOther = parseFloat(eventObj.data.additionalAmount) / 1000000000000000000;
        }
        else if (eventObj.name === "TranscoderActivated") {
          eventContainsTranscoderActivated = true;
          eventCaller = eventObj.data.transcoder.toLowerCase();
          tmpWhen = eventObj.data.activationRound;
        }
        else if (eventObj.name === "Unbond") {
          eventContainsUnbond = true;
          eventCaller = eventObj.data.delegator.toLowerCase();
          eventFrom = eventObj.data.delegate.toLowerCase();
          tmpAmount = parseFloat(eventObj.data.amount) / 1000000000000000000;
          tmpWhen = eventObj.data.withdrawRound;
        }
        else if (eventObj.name === "Rebond") {
          eventContainsRebond = true;
          eventCaller = eventObj.data.delegator.toLowerCase();
          eventTo = eventObj.data.delegate.toLowerCase();
          tmpAmount = parseFloat(eventObj.data.amount) / 1000000000000000000;
        }
        else if (eventObj.name === "TransferBond") {
          eventContainsTransferBond = true;
          if (!eventContainsUnbond) {
            eventFrom = eventObj.data.oldDelegator.toLowerCase();
          }
          if (!eventContainsRebond) {
            eventTo = eventObj.data.newDelegator.toLowerCase();
          }
          tmpAmount = parseFloat(eventObj.data.amount) / 1000000000000000000;
        } else {
          console.log("UNIMPLEMENTED: " + eventObj.name);
        }
      }
    }
    // NOTE: We are throwing away the very oldest Event now, which should be fine.
    // We can fix this once above wall of text becomes a separate function
    return dispatch(setEvents(finalEventList));
  }
  return dispatch(receiveErrors(data));
};

export const getCurrentOrchestratorInfo = () => async dispatch => {
  const response = await apiUtil.getCurrentOrchestratorInfo();
  const data = await response.json();
  if (response.ok) {
    return dispatch(setCurrentOrchestratorInfo(data));
  }
  return dispatch(receiveErrors(data));
};

export const getOrchestratorInfo = (orchAddr) => async dispatch => {
  const response = await apiUtil.getOrchestratorInfo(orchAddr);
  const data = await response.json();
  if (response.ok) {
    if (data && data.id){
      return dispatch(setOrchestratorInfo(data));
    }else{
      const response = await apiUtil.getOrchestratorByDelegator(orchAddr);
      const data = await response.json();
      if (response.ok) {
        return dispatch(setOrchestratorInfo(data));
      }
    }
  }
  return dispatch(receiveErrors(data));
};