import React from "react";

const EventButton = (obj) => {
  let eventSpecificInfo;
  if (obj.name == "EarningsClaimed") {
    eventSpecificInfo = <div className="row">
      <p>(Round {obj.data.endRound}) Claim: {obj.data.delegator} earned {obj.data.rewards / 1000000000000000000} Eth @ Orchestrator {obj.data.delegate}</p>
    </div>
  } else if (obj.name == "Unbond") {
    eventSpecificInfo = <div className="row">
      <p>(Round {obj.data.withdrawRound}) Unbond: {obj.data.delegator} unbonded {obj.data.amount / 1000000000000000000} Eth @ Orchestrator {obj.data.delegate}</p>
    </div>
  } else if (obj.name == "TransferBond") {
    eventSpecificInfo = <div className="row">
      <p>TransferBond: transfered bond worth {obj.data.amount / 1000000000000000000} Eth from {obj.data.oldDelegator} to {obj.data.newDelegator}</p>
    </div>
  } else if (obj.name == "Bond") {
    eventSpecificInfo = <div className="row" style={{ backgroundColor: 'rgba(50,50,50,0.3)' }}>
      <p>Bond: {obj.data.delegator} delegated {obj.data.bondedAmount / 1000000000000000000} LPT from {obj.data.oldDelegate} to {obj.data.newDelegate}</p>
    </div>
  } else if (obj.name == "Rebond") {
    eventSpecificInfo = <div className="row">
      <p>Rebond: {obj.data.delegator} @ {obj.data.delegate}</p>
    </div>
  } else if (obj.name == "WithdrawFees") {
    eventSpecificInfo = <div className="row">
      <p>WithdrawFees: {obj.data.amount / 1000000000000000000} Eth {obj.data.delegator} to {obj.data.recipient}</p>
    </div>
  } else if (obj.name == "Reward") {
    eventSpecificInfo = <div className="row">
      <p>Reward: T {obj.data.transcoder} earned {obj.data.amount / 1000000000000000000} Eth</p>
    </div>
  } else if (obj.name == "TranscoderUpdate") {
    eventSpecificInfo = <div className="row" style={{ backgroundColor: 'rgba(245, 5, 89, 0.3)' }}>
      <p>Reward: T {obj.data.transcoder} changed their rewardCut to {obj.data.rewardCut} and their feeShare to {obj.data.feeShare}</p>
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