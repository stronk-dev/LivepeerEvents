import React from "react";
import {
  getOrchestratorInfo
} from "./actions/livepeer";
import { useDispatch } from 'react-redux';

/// Displays a single event. Sets selected Orchestrator info in the redux store

const activationColour = "rgba(23, 60, 122, 0.3)";
const rewardColour = "rgba(20, 99, 29, 0.3)";
const updateColour = "rgba(122, 63, 23, 0.3)";
const withdrawStakeColour = "rgba(102, 3, 10, 0.3)";
const stakeColour = "rgba(71, 23, 122, 0.3)";
const claimColour = "rgba(77, 91, 42, 0.3)";

const EventButton = (obj) => {
  const dispatch = useDispatch();
  // Data shared among all events in this transaction
  const thisURL = obj.transactionUrl;
  //const thisTransaction = obj.transactionHash;
  const thisData = obj.events;
  //const thisIndex = obj.idx;
  // Abstraction of all events in this transaction
  let transactionName = "";
  let transactionCaller = "";
  let transactionFrom = "";
  let transactionTo = "";
  let transactionAmount = 0;
  let transactionAdditionalAmount = 0;
  let transactionWhen = 0;
  let hasBondTransaction = false;
  let hasRebondTransaction = false;
  let hasUnbondTransaction = false;
  let hasTransferbondTransaction = false;
  let hasEarningsClaimed = false;
  let hasActivation = false;
  let isOnlyBondRelated = true;
  let thisColour = "";

  // Which we will fill in by going over all of the events once
  thisData.map(eventObj => {
    // Bond: contains amount the transaction is about and who is participating
    if (eventObj.name === "Bond" && !hasEarningsClaimed) {
      transactionCaller = eventObj.data.delegator.toLowerCase();
      transactionFrom = eventObj.data.oldDelegate.toLowerCase();
      transactionTo = eventObj.data.newDelegate.toLowerCase();
      transactionAmount = parseFloat(eventObj.data.bondedAmount);
      transactionAdditionalAmount = parseFloat(eventObj.data.additionalAmount);
      hasBondTransaction = true;
    }
    // Unbond: defines transactionWhen. Defines transactionAmount as X / 1000000000000000000 LPT
    if (eventObj.name === "Unbond") {
      // Caller and from will get overwritten by TranserBond or Rebond, but might as well set them
      if (isOnlyBondRelated) {
        transactionCaller = eventObj.data.delegate.toLowerCase();
        transactionFrom = eventObj.data.delegator.toLowerCase();
        transactionAmount = parseFloat(eventObj.data.amount) / 1000000000000000000;
      }
      hasUnbondTransaction = true;
    }
    // TransferBond: defines to transactionFrom and transactionTo. Defines transactionAmount as X / 1000000000000000000 LPT
    if (eventObj.name === "TransferBond") {
      // transactionFrommight get overwritten by Rebond, but might as well set them
      if (isOnlyBondRelated) {
        transactionFrom = eventObj.data.oldDelegator.toLowerCase();
        transactionTo = eventObj.data.newDelegator.toLowerCase();
        transactionAmount = parseFloat(eventObj.data.amount) / 1000000000000000000;
      }
      hasTransferbondTransaction = true;
    }
    // TransferBond: defines to transactionFrom and transactionTo. Defines transactionAmount as X / 1000000000000000000 LPT
    if (eventObj.name === "Rebond") {
      // transactionCaller might get overwritten by TranserBond, but might as well set them
      if (isOnlyBondRelated) {
        transactionCaller = eventObj.data.delegate.toLowerCase();
        transactionFrom = eventObj.data.delegator.toLowerCase();
        transactionAmount = parseFloat(eventObj.data.amount) / 1000000000000000000;
      }
      hasRebondTransaction = true;
    }

    // TranscoderActivated: defines transactionName as a stake claim. Defines transactionWhen
    if (eventObj.name === "EarningsClaimed" && !hasActivation) {
      transactionName = "Claim";
      transactionWhen = eventObj.data.endRound;
      transactionFrom = eventObj.data.delegate;
      transactionCaller = eventObj.data.delegator;
      transactionAmount = parseFloat(eventObj.data.rewards) / 1000000000000000000;
      transactionAdditionalAmount = parseFloat(eventObj.data.fees) / 1000000000000000000;
      thisColour = claimColour;
      isOnlyBondRelated = false;
      hasEarningsClaimed = true;
    }
    // TranscoderActivated: defines transactionName. Defines transactionAmount as X * 7e-18 LPT
    if (eventObj.name === "TranscoderActivated") {
      transactionName = "Activated";
      transactionWhen = eventObj.data.activationRound;
      if (!hasBondTransaction) {
        transactionCaller = eventObj.data.transcoder.toLowerCase();
      }
      thisColour = activationColour;
      isOnlyBondRelated = false;
      hasActivation = true;
    }
    // TranscoderActivated: defines transactionName. Defines transactionAmount as X / 1000000000000000000 LPT
    if (eventObj.name === "Reward") {
      transactionName = "Reward";
      transactionCaller = eventObj.data.transcoder.toLowerCase();
      transactionAmount = parseFloat(eventObj.data.amount) / 1000000000000000000;
      thisColour = rewardColour;
      isOnlyBondRelated = false;
    }
    // TranscoderUpdate: defines transactionName. Defines transactionAmount as rewardCut and transactionAdditionalAmount as feeCut
    if (eventObj.name === "TranscoderUpdate") {
      transactionName = "Update";
      transactionCaller = eventObj.data.transcoder.toLowerCase();
      transactionAmount = eventObj.data.rewardCut / 10000;
      transactionAdditionalAmount = 100 - (eventObj.data.feeShare / 10000);
      thisColour = updateColour;
      isOnlyBondRelated = false;
    }
    // WithdrawStake: defines transactionName. Defines transactionAmount as rewardCut and transactionAdditionalAmount as feeCut
    if (eventObj.name === "WithdrawStake") {
      transactionName = "Withdraw";
      transactionCaller = eventObj.data.delegator.toLowerCase();
      transactionAmount = parseFloat(eventObj.data.amount) / 1000000000000000000;
      transactionWhen = eventObj.data.withdrawRound;
      thisColour = withdrawStakeColour;
      isOnlyBondRelated = false;
    }
  })

  // If we only had a bond transaction and nothing else, this is a stake
  if (isOnlyBondRelated) {
    if (hasBondTransaction) {
      transactionName = "Stake";
      thisColour = stakeColour;
    } else if (hasRebondTransaction) {
      console.log("Filtering out lone Rebond");
      return null;
    }
  }

  // Check name filter on transactionCaller, transactionFrom, transactionTo
  if (obj.searchTerm) {
    if (obj.searchTerm !== "") {
      let isFiltered = true;
      if (transactionCaller.toLowerCase().includes(obj.searchTerm.toLowerCase())) isFiltered = false;
      if (transactionFrom.toLowerCase().includes(obj.searchTerm.toLowerCase())) isFiltered = false;
      if (transactionTo.toLowerCase().includes(obj.searchTerm.toLowerCase())) isFiltered = false;
      if (isFiltered) return null;
    }
  }
  let isFiltered = true;
  // Check boolean filters on transactionName
  let count = 0;
  if (obj.filterActivated) {
    if (transactionName === "Activated") {
      isFiltered = false;
    }
    count++;
  }
  if (obj.rewardActivated) {
    if (transactionName === "Reward") {
      isFiltered = false;
    }
    count++;
  }
  if (obj.updateActivated) {
    if (transactionName === "Update") {
      isFiltered = false;
    }
    count++;
  }
  if (obj.withdrawActivated) {
    if (transactionName === "Withdraw") {
      isFiltered = false;
    }
    count++;
  }
  if (obj.stakeActivated) {
    if (transactionName === "Stake") {
      isFiltered = false;
    }
    count++;
  }
  if (obj.delegatorRewardActivated) {
    if (transactionName === "Claim") {
      isFiltered = false;
    }
    count++;
  }
  if (isFiltered && count) {
    return null;
  }

  // Displays info specific to a type of transactions
  let eventSpecificInfo;
  if (transactionName === "Reward") {
    if (transactionAmount - 69 < 1 && transactionAmount - 69 > 0) {
      eventSpecificInfo =
        <div className="rowAlignLeft">
          <p>called reward worth {transactionAmount.toFixed(2)} LPT. nice</p>
        </div>
    } else {
      eventSpecificInfo =
        <div className="rowAlignLeft">
          <p>called reward worth {transactionAmount.toFixed(2)} LPT</p>
        </div>
    }
  } else if (transactionName === "Claim") {
    if (transactionFrom == "0x0000000000000000000000000000000000000000") {
      return null;
    }
    let claimString = "claimed ";
    if (transactionAmount > 0.001){
      claimString += transactionAmount.toFixed(2) + " LPT staking rewards";
      if (transactionAdditionalAmount > 0.00009){
        claimString += " and "
      }
    }
    if (transactionAdditionalAmount > 0.00009){
      claimString += transactionAdditionalAmount.toFixed(4) + " Eth fee rewards";
    }
    eventSpecificInfo =
      <div className="rowAlignLeft">
        <p>{claimString} at </p>
        <button className="selectOrch" onClick={() => { dispatch(getOrchestratorInfo(transactionFrom)) }} >{transactionFrom}</button>
      </div>
  } else if (transactionName === "Update") {
    eventSpecificInfo =
      <div className="rowAlignLeft">
        <p>changed their reward commission to {transactionAmount.toFixed(2)}% and their fee commission to {transactionAdditionalAmount.toFixed(2)}%</p>
      </div>
  } else if (transactionName === "Stake") {
    if (transactionFrom == "0x0000000000000000000000000000000000000000") {
      eventSpecificInfo =
        <div className="rowAlignLeft">
          <p> staked {(transactionAmount / 1000000000000000000).toFixed(2)} LPT to </p>
          <button className="selectOrch" onClick={() => { dispatch(getOrchestratorInfo(transactionTo)) }} >{transactionTo}</button>
        </div>
    } else {
      eventSpecificInfo =
        <div className="rowAlignLeft">
          <p> moved {(transactionAmount / 1000000000000000000).toFixed(2)} LPT stake: </p>
          <button className="selectOrch" onClick={() => { dispatch(getOrchestratorInfo(transactionFrom)) }} >{transactionFrom}</button>
          <p> to </p>
          <button className="selectOrch" onClick={() => { dispatch(getOrchestratorInfo(transactionTo)) }} >{transactionTo}</button>
        </div>
    }
  } else if (transactionName === "Withdraw") {
    eventSpecificInfo =
      <div className="rowAlignLeft">
        <p> withdrew {(transactionAmount).toFixed(2)} LPT in round {transactionWhen}</p>
      </div>
  } else if (transactionName === "Activated") {
    if (hasBondTransaction) {
      eventSpecificInfo =
        <div className="rowAlignLeft">
          <p>activated with a self stake of {(transactionAmount / 1000000000000000000).toFixed(2)} LPT and will become active in round {transactionWhen}</p>
        </div>
    } else {
      // If there was no bond transaction, display fewer information
      eventSpecificInfo =
        <div className="rowAlignLeft">
          <p>reactivated and will become active in round {transactionWhen}</p>
        </div>
    }
  } else {
    console.log(thisData);
    eventSpecificInfo = <div className="row">
      <p>UNIMPLEMENTED</p>
    </div>
  }

  // IF ON MOBILE
  // transactionCaller.substring(0,8)+"..."

  return (
    <div className="row" style={{ backgroundColor: thisColour, borderRadius: "1.2em" }}>
      <div style={{ flexDirection: 'row', display: "flex" }}>
        <a href={"https://explorer.livepeer.org/accounts/" + transactionCaller}>
          <img alt="" src="livepeer.png" width="30" height="30" />
        </a>
        <div className="row">
          <button className="selectOrch" onClick={() => { dispatch(getOrchestratorInfo(transactionCaller)) }} >{transactionCaller}</button>
        </div>
      </div>
      {eventSpecificInfo}
      <a href={thisURL}>
        <img alt="" src="arb.svg" width="30" height="30" />
      </a>
    </div>
  )
}

export default EventButton;