import React from "react";

const activationColour = "rgba(23, 60, 122, 0.3)";
const rewardColour = "rgba(20, 99, 29, 0.3)";
const updateColour = "rgba(122, 63, 23, 0.3)";
const withdrawStakeColour = "rgba(102, 3, 10, 0.3)";
const stakeColour = "rgba(71, 23, 122, 0.3)";

const EventButton = (obj) => {
  // Data shared among all events in this transaction
  const thisURL = obj.transactionUrl;
  const thisTransaction = obj.transactionHash;
  const thisData = obj.events;
  const thisIndex = obj.idx;
  // Abstraction of all events in this transaction
  let transactionName = "";
  let transactionCaller = "";
  let transactionFrom = "";
  let transactionTo = "";
  let transactionAmount = 0;
  let transactionAdditionalAmount = 0;
  let transactionWhen = 0;
  let hasBondTransaction = false;
  let isOnlyBond = true;
  let thisColour = "";


  // Which we will fill in by going over all of the events once
  thisData.map(eventObj => {
    // Bond: contains amount the transaction is about and who is participating
    if (eventObj.name == "Bond") {
      transactionCaller = eventObj.data.delegator;
      transactionFrom = eventObj.data.oldDelegate;
      transactionTo = eventObj.data.newDelegate;
      transactionAmount = parseFloat(eventObj.data.bondedAmount);
      transactionAdditionalAmount = parseFloat(eventObj.data.additionalAmount);
      hasBondTransaction = true;
    }
    // TranscoderActivated: defines transactionName. Defines transactionAmount as X * 7e-18 LPT
    if (eventObj.name == "TranscoderActivated") {
      transactionName = "Activated";
      transactionWhen = eventObj.data.activationRound;
      if (!hasBondTransaction) {
        transactionCaller = eventObj.data.transcoder;
      }
      thisColour = activationColour;
      isOnlyBond = false;
    }
    // TranscoderActivated: defines transactionName. Defines transactionAmount as X / 1000000000000000000 LPT
    if (eventObj.name == "Reward") {
      transactionName = "Reward";
      transactionCaller = eventObj.data.transcoder;
      transactionAmount = eventObj.data.amount / 1000000000000000000;
      thisColour = rewardColour;
      isOnlyBond = false;
    }
    // TranscoderUpdate: defines transactionName. Defines transactionAmount as rewardCut and transactionAdditionalAmount as feeCut
    if (eventObj.name == "TranscoderUpdate") {
      transactionName = "Update";
      transactionCaller = eventObj.data.transcoder;
      transactionAmount = eventObj.data.rewardCut / 10000;
      transactionAdditionalAmount = 100 - (eventObj.data.feeShare / 10000);
      thisColour = updateColour;
      isOnlyBond = false;
    }
    // WithdrawStake: defines transactionName. Defines transactionAmount as rewardCut and transactionAdditionalAmount as feeCut
    if (eventObj.name == "WithdrawStake") {
      transactionName = "Withdraw";
      transactionCaller = eventObj.data.delegator;
      transactionAmount = eventObj.data.amount / 1000000000000000000;
      transactionWhen = eventObj.data.withdrawRound;
      thisColour = withdrawStakeColour;
      isOnlyBond = false;
    }
  })

  // If we only had a bond transaction and nothing else, this is a stake
  if (hasBondTransaction && isOnlyBond) {
    transactionName = "Stake";
    thisColour = stakeColour;
  }

  let eventSpecificInfo;
  if (transactionName == "Reward") {
    if (transactionAmount - 69 < 1 && transactionAmount - 69 > 0) {
      eventSpecificInfo =
        <div className="row">
          <p>called reward worth {transactionAmount.toFixed(2)} LPT. nice</p>
        </div>
    } else {
      eventSpecificInfo =
        <div className="row">
          <p>called reward worth {transactionAmount.toFixed(2)} LPT</p>
        </div>
    }
  } else if (transactionName == "Update") {
    eventSpecificInfo =
      <div className="row">
        <p>changed their reward commission to {transactionAmount.toFixed(2)}% and their fee commission to {transactionAdditionalAmount.toFixed(2)}%</p>
      </div>
  } else if (transactionName == "Stake") {
    if (transactionFrom == "0x0000000000000000000000000000000000000000") {
      eventSpecificInfo =
        <div className="row">
          <p> staked {(transactionAmount / 1000000000000000000).toFixed(2)} LPT to {transactionTo} </p>
        </div>
    } else {
      eventSpecificInfo =
        <div className="row">
          <p> changed stake from {transactionFrom} to {transactionTo} of {(transactionAmount / 1000000000000000000).toFixed(2)} LPT</p>
        </div>
    }
  } else if (transactionName == "Withdraw") {
    eventSpecificInfo =
      <div className="row">
        <p> withdrew {(transactionAmount / 1000000000000000000).toFixed(2)} LPT in round {transactionWhen}</p>
      </div>
  } else if (transactionName == "Activated") {
    if (hasBondTransaction) {
      eventSpecificInfo =
        <div className="row">
          <p>{transactionCaller} activated with a self stake of {(transactionAmount / 1000000000000000000).toFixed(2)} LPT and will become active in round {transactionWhen}</p>
        </div>
    } else {
      // If there was no bond transaction, display fewer information
      eventSpecificInfo =
        <div className="row">
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
      <a href={"https://explorer.livepeer.org/accounts/" + transactionCaller} style={{ flexDirection: 'row', display: "flex" }}>
        <img alt="" src="livepeer.png" width="30" height="30" />
        <p>{transactionCaller}</p>
      </a>
      {eventSpecificInfo}
      <a href={thisURL}>
        <img alt="" src="arb.svg" width="30" height="30" />
      </a>
    </div>
  )
}

export default EventButton;