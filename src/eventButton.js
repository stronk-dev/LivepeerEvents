import React from "react";

const EventButton = (obj) => {
  let eventSpecificInfo;
  if (obj.name == "EarningsClaimed") {
    eventSpecificInfo = <div className="row">
      <p>(Round {obj.data.endRound}) Claim: {obj.data.delegator} earned {(obj.data.rewards / 1000000000000000000).toFixed(4)} Eth @ Orchestrator {obj.data.delegate}</p>
    </div>
  } else if (obj.name == "Unbond") {
    eventSpecificInfo = <div className="row">
      <p>(Round {obj.data.withdrawRound}) Unbond: {obj.data.delegator} unbonded {(obj.data.amount / 1000000000000000000).toFixed(4)} Eth @ Orchestrator {obj.data.delegate}</p>
    </div>
  } else if (obj.name == "TransferBond") {
    eventSpecificInfo = <div className="row">
      <p>TransferBond: transfered bond worth {(obj.data.amount / 1000000000000000000).toFixed(4)} Eth from {obj.data.oldDelegator} to {obj.data.newDelegator}</p>
    </div>
  } else if (obj.name == "Bond") {
    eventSpecificInfo = <div className="row" style={{ backgroundColor: 'rgba(50,50,50,0.3)' }}>
      <p>{obj.data.delegator} delegated {(obj.data.bondedAmount / 1000000000000000000).toFixed(4)} LPT from {obj.data.oldDelegate} to {obj.data.newDelegate}</p>
    </div>
  } else if (obj.name == "Rebond") {
    eventSpecificInfo = <div className="row">
      <p>Rebond: {obj.data.delegator} @ {obj.data.delegate}</p>
    </div>
  } else if (obj.name == "WithdrawFees") {
    eventSpecificInfo = <div className="row">
      <p>{obj.data.recipient} claimed stake</p>
    </div>
  } else if (obj.name == "WithdrawStake") {
    eventSpecificInfo = <div className="row" style={{ backgroundColor: 'rgba(255, 0, 0, 0.3)' }}>
      <p>{obj.data.delegator} withdrew stake worth {(obj.data.amount / 1000000000000000000).toFixed(4)} LPT in round {obj.data.withdrawRound}</p>
    </div>
  } else if (obj.name == "Reward") {
    eventSpecificInfo = <div className="row" style={{ backgroundColor: 'rgba(0, 179, 221, 0.3)' }}>
      <p>O {obj.data.transcoder} called reward for {(obj.data.amount / 1000000000000000000).toFixed(4)} LPT</p>
    </div>
  } else if (obj.name == "TranscoderUpdate") {
    eventSpecificInfo = <div className="row" style={{ backgroundColor: 'rgba(215, 15, 0, 0.3)' }}>
      <p>O {obj.data.transcoder} changed their rewardCut to {obj.data.rewardCut} and their feeShare to {obj.data.feeShare}</p>
    </div>
  } else if (obj.name == "TranscoderActivated") {
    eventSpecificInfo = <div className="row" style={{ backgroundColor: 'rgba(0, 255, 1, 0.3)' }}>
      <p>O {obj.data.transcoder} activated and will become active in {obj.data.activationRound}</p>
    </div>
  } else {
    console.log(obj);
    eventSpecificInfo = <div className="row">
      <p>UNIMPLEMENTED: {obj.event}</p>
    </div>
  }

  return (
    <a href={obj.transactionUrl} className="row">
      <img alt="" src="livepeer.png" width="30" height="30" />
      {obj.idx}: {eventSpecificInfo}
    </a>
  )
}

export default EventButton;