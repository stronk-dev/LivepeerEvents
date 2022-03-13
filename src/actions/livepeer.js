import * as apiUtil from "../util/livepeer";
import { receiveErrors } from "./error";
import React from "react";

const claimColour = "rgba(25, 158, 29, 0.3)";
const stakeColour = "rgba(25, 158, 147, 0.3)";
const ticketRedeemColour = "rgba(25, 98, 158, 0.3)";
const rewardColour = "rgba(25, 27, 158, 0.3)";
const unbondColour = "rgba(105, 25, 158, 0.3)";
const updateColour = "rgba(158, 25, 52, 0.3)";
const withdrawStakeColour = "rgba(158, 98, 25, 0.3)";
const activationColour = "rgba(154, 158, 25, 0.3)";

const ticketTransferColour = "rgba(88, 91, 42, 0.3)";

const thresholdStaking = 0.001;
const thresholdFees = 0.00009;

export const RECEIVE_QUOTES = "RECEIVE_QUOTES";
export const RECEIVE_BLOCKCHAIN_DATA = "RECEIVE_BLOCKCHAIN_DATA";
export const RECEIVE_EVENTS = "RECEIVE_EVENTS";
export const RECEIVE_CURRENT_ORCHESTRATOR = "RECEIVE_CURRENT_ORCHESTRATOR";
export const RECEIVE_ORCHESTRATOR = "RECEIVE_ORCHESTRATOR";
export const CLEAR_ORCHESTRATOR = "CLEAR_ORCHESTRATOR";
export const RECEIVE_TICKETS = "RECEIVE_TICKETS";

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
const clearOrchestratorInfo = () => ({
  type: CLEAR_ORCHESTRATOR
})
const setTickets = message => ({
  type: RECEIVE_TICKETS, message
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
      for (const eventObj of data) {
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
              eventDescription =
                <div className="rowAlignLeft" style={{ justifyContent: 'space-between' }}>
                  <div className="strokeSmollLeft">
                    <div className="row">
                      <h3 style={{ margin: 0, padding: 0 }}>🚀</h3>
                    </div>
                    <div className="row">
                      <p style={{ fontSize: 'small' }}>
                        activated their orchestrator
                      </p>
                    </div>
                  </div>
                  <div className="strokeSmollLeft">
                    <p style={{ fontSize: 'small' }}>
                      {tmpAmount.toFixed(2)} LPT stake
                    </p>
                    <p style={{ fontSize: 'small' }}>
                      round {tmpWhen}
                    </p>
                  </div>
                </div>
            } else {
              eventDescription =
                <div className="rowAlignLeft" style={{ justifyContent: 'space-between' }}>
                  <div className="strokeSmollLeft">
                    <div className="row">
                      <h3 style={{ margin: 0, padding: 0 }}>🚀</h3>
                    </div>
                    <div className="row">
                      <p style={{ fontSize: 'small' }}>
                        reactivated their orchestrator
                      </p>
                    </div>
                  </div>
                  <div className="strokeSmollLeft">
                    <p style={{ fontSize: 'small' }}>
                      round {tmpWhen}
                    </p>
                  </div>
                </div>
            }
          }
          // Lone Unbond => Unbond Event
          else if (eventContainsUnbond) {
            eventType = "Unbond";
            eventColour = unbondColour;
            eventDescription =
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <div className="strokeSmollLeft">
                  <div className="row">
                    <h3 style={{ margin: 0, padding: 0 }}>❌</h3>
                  </div>
                  <div className="row">
                    <p style={{ fontSize: 'small' }}>
                      unbonded
                    </p>
                  </div>
                </div>
                <div className="strokeSmollLeft">
                  <p style={{ fontSize: 'small' }}>
                    {tmpAmount.toFixed(2)} LPT
                  </p>
                  <p style={{ fontSize: 'small' }}>
                    round {tmpWhen}
                  </p>
                </div>
              </div>
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
            eventDescription =
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <div className="strokeSmollLeft">
                  <div className="row">
                    <h3 style={{ margin: 0, padding: 0 }}>⌛</h3>
                  </div>
                  <div className="row">
                    <p style={{ fontSize: 'small' }}>
                      changed stake amount
                    </p>
                  </div>
                </div>
                <div className="strokeSmollLeft">
                  <p style={{ fontSize: 'small' }}>
                    {tmpAmount.toFixed(2)} LPT
                  </p>
                </div>
              </div>
          }

          // Fill description of Stake Event if it wasn't set yet
          if (eventType === "Stake" && eventDescription === "") {
            if (eventFrom === "0x0000000000000000000000000000000000000000") {
              eventDescription =
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <div className="strokeSmollLeft">
                    <div className="row">
                      <h3 style={{ margin: 0, padding: 0 }}>⌛</h3>
                    </div>
                    <div className="row">
                      <p style={{ fontSize: 'small' }}>
                        is now staking
                      </p>
                    </div>
                  </div>
                  <div className="strokeSmollLeft">
                    <p style={{ fontSize: 'small' }}>
                      {tmpAmount.toFixed(2)} LPT
                    </p>
                  </div>
                </div>
            } else if (eventFrom === eventTo) {
              eventFrom = "";
              eventDescription =
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <div className="strokeSmollLeft">
                    <div className="row">
                      <h3 style={{ margin: 0, padding: 0 }}>⌛</h3>
                    </div>
                    <div className="row">
                      <p style={{ fontSize: 'small' }}>
                        changed stake amount
                      </p>
                    </div>
                  </div>
                  <div className="strokeSmollLeft">
                    <p style={{ fontSize: 'small' }}>
                      {tmpAmount.toFixed(2)} LPT
                    </p>
                  </div>
                </div>
            } else {
              eventDescription =
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <div className="strokeSmollLeft">
                    <div className="row">
                      <h3 style={{ margin: 0, padding: 0 }}>⌛</h3>
                    </div>
                    <div className="row">
                      <p style={{ fontSize: 'small' }}>
                        moved stake to a new orchestrator
                      </p>
                    </div>
                  </div>
                  <div className="strokeSmollLeft">
                    <p style={{ fontSize: 'small' }}>
                      {tmpAmount.toFixed(2)} LPT
                    </p>
                  </div>
                </div>

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
          const txt =
            <div className="rowAlignLeft" style={{ justifyContent: 'space-between' }}>
              <div className="strokeSmollLeft">
                <div className="row">
                  <h3 style={{ margin: 0, padding: 0 }}>🏦</h3>
                </div>
                <div className="row">
                  <p style={{ fontSize: 'small' }}>
                    withdrew staking rewards
                  </p>
                </div>
              </div>
              <div className="strokeSmollLeft">
                <p style={{ fontSize: 'small' }}>
                  {amount.toFixed(2)} LPT
                </p>
                <p style={{ fontSize: 'small' }}>
                  round {eventObj.data.withdrawRound}
                </p>
              </div>
            </div>
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
          const txt =
            <div className="rowAlignLeft" style={{ justifyContent: 'space-between' }}>
              <div className="strokeSmollLeft">
                <div className="row">
                  <h3 style={{ margin: 0, padding: 0 }}>🏦</h3>
                </div>
                <div className="row">
                  <p style={{ fontSize: 'small' }}>
                    withdrew fee rewards
                  </p>
                </div>
              </div>
              <div className="strokeSmollLeft">
                <p style={{ fontSize: 'small' }}>
                  {amount.toFixed(4)} Eth
                </p>
                <p style={{ fontSize: 'small' }}>
                  round {eventObj.data.withdrawRound}
                </p>
              </div>
            </div>
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
          const txt =
            <div className="rowAlignLeft" style={{ justifyContent: 'space-between' }}>
              <div className="strokeSmollLeft">
                <div className="row">
                  <h3 style={{ margin: 0, padding: 0 }}>🔄</h3>
                </div>
                <div className="row">
                  <p style={{ fontSize: 'small' }}>
                    changed commission rates
                  </p>
                </div>
              </div>
              <div className="strokeSmollLeft">
                <p style={{ fontSize: 'small' }}>
                  {amount1.toFixed(2)}% on staking rewards
                </p>
                <p style={{ fontSize: 'small' }}>
                  {amount2.toFixed(2)}% on transcoding fees
                </p>
              </div>
            </div>
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
          let txt =
            <div className="rowAlignLeft" style={{ justifyContent: 'space-between' }}>
              <div className="strokeSmollLeft">
                <div className="row">
                  <h3 style={{ margin: 0, padding: 0 }}>💰</h3>
                </div>
                <div className="row">
                  <p style={{ fontSize: 'small' }}>
                    delegator claimed {eventObj.data.endRound - eventObj.data.startRound + 1} rounds of rewards
                  </p>
                </div>
              </div>
              <div className="strokeSmollLeft">
                <p style={{ fontSize: 'small' }}>
                  +{amount1.toFixed(2)} LPT rewards
                </p>
                <p style={{ fontSize: 'small' }}>
                  +{amount2.toFixed(4)} Eth fees
                </p>
              </div>
            </div>
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
          let txt =
            <div className="rowAlignLeft" style={{ justifyContent: 'space-between' }}>
              <div className="strokeSmollLeft">
                <div className="row">
                  <h3 style={{ margin: 0, padding: 0 }}>💸</h3>
                </div>
                <div className="row">
                  <p style={{ fontSize: 'small' }}>
                    called reward
                  </p>
                </div>
              </div>
              <div className="strokeSmollLeft">
                <p style={{ fontSize: 'small' }}>
                  +{amount1.toFixed(2)} LPT
                </p>
              </div>
            </div>
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

export const getTickets = () => async dispatch => {
  const response = await apiUtil.getTickets();
  const data = await response.json();
  // Combine raw list of events into a list of useful Events
  if (response.ok) {
    let finalTicketList = [];
    // Current transaction we are processing
    let txCounter = 0;
    let currentTx = "";
    let currentUrl = "";
    let currentBlock = 0;
    let currentTime = 0;
    // Parse Tickets
    {
      for (const eventObj of data) {
        if (currentTx === "") {
          currentTx = eventObj.transactionHash;
          currentUrl = eventObj.transactionUrl;
          currentBlock = eventObj.blockNumber;
          currentTime = eventObj.blockTime;
        }
        // New transaction found
        if (currentTx !== eventObj.transactionHash) {
          // Reset event data
          txCounter++;
          currentTx = eventObj.transactionHash;
          currentUrl = eventObj.transactionUrl;
          currentBlock = eventObj.blockNumber;
          currentTime = eventObj.blockTime;
        }
        // Always split off WithdrawStake as a separate Withdraw Event
        if (eventObj.name === "WinningTicketRedeemed") {
          const amount = parseFloat(eventObj.data.faceValue) / 1000000000000000000;
          const txt =
            <div className="row">
              <div className="strokeSmollLeft">
                <div className="row">
                  <h3 style={{ margin: 0, padding: 0 }}>🎟️</h3>
                </div>
                <div className="strokeSmollLeft">
                  <p style={{ fontSize: 'small' }}>
                    winning ticket
                  </p>
                </div>
              </div>
              <p style={{ fontSize: 'small' }}>
                +{amount.toFixed(4)} Eth
              </p>
            </div>
          finalTicketList.push({
            eventType: "RedeemTicket",
            eventDescription: txt,
            eventCaller: eventObj.data.recipient.toLowerCase(),
            eventFrom: "",//eventObj.data.sender.toLowerCase(),
            eventTo: "",//eventObj.data.recipient.toLowerCase(),
            eventColour: ticketRedeemColour,
            transactionHash: currentTx,
            transactionUrl: currentUrl,
            transactionBlock: currentBlock,
            transactionTime: currentTime,
            eventValue: amount
          });
        } else if (eventObj.name === "WinningTicketTransfer") {
          // For now lets just ignore these, they are boring
          continue;
          const amount = parseFloat(eventObj.data.amount) / 1000000000000000000;
          const txt = " broadcaster payed out  " + amount.toFixed(4) + " Eth";
          finalTicketList.push({
            eventType: "TransferTicket",
            eventDescription: txt,
            eventCaller: "",
            eventFrom: eventObj.data.sender.toLowerCase(),
            eventTo: eventObj.data.recipient.toLowerCase(),
            eventColour: ticketTransferColour,
            transactionHash: currentTx,
            transactionUrl: currentUrl,
            transactionBlock: currentBlock,
            transactionTime: currentTime,
            eventValue: amount
          });
        } else {
          console.log("UNIMPLEMENTED: " + eventObj.name);
        }
      }
    }
    // NOTE: We are throwing away the very oldest Ticket now, which should be fine.
    // We can fix this once above wall of text becomes a separate function
    return dispatch(setTickets(finalTicketList));
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
    if (data && data.id) {
      return dispatch(setOrchestratorInfo(data));
    } else {
      const response = await apiUtil.getOrchestratorByDelegator(orchAddr);
      const data = await response.json();
      if (response.ok) {
        return dispatch(setOrchestratorInfo(data));
      }
    }
  }
  return dispatch(receiveErrors(data));
};

export const clearOrchestrator = () => async dispatch => {
  return dispatch(clearOrchestratorInfo({}));
};