import React from "react";

const Orchestrator = (obj) => {
  let rewardCut = 0;
  let feeCut = 0;
  let totalStake = 0;
  let totalVolumeETH = 0;
  let totalVolumeUSD = 0;
  let delegators = [];
  let selfStake = 0;
  let selfStakeRatio = 0;
  if (obj.thisOrchestrator) {
    if (obj.thisOrchestrator.rewardCut) {
      rewardCut = (obj.thisOrchestrator.rewardCut / 10000).toFixed(2);
    }
    if (obj.thisOrchestrator.feeShare) {
      feeCut = (100 - (obj.thisOrchestrator.feeShare / 10000)).toFixed(2);
    }
    if (obj.thisOrchestrator.totalStake) {
      totalStake = parseFloat(obj.thisOrchestrator.totalStake).toFixed(2);
    }
    if (obj.thisOrchestrator.totalVolumeETH) {
      totalVolumeETH = parseFloat(obj.thisOrchestrator.totalVolumeETH * 1).toFixed(4);
    }
    if (obj.thisOrchestrator.totalVolumeUSD) {
      totalVolumeUSD = parseFloat(obj.thisOrchestrator.totalVolumeUSD * 1).toFixed(2);
    }
    if (obj.thisOrchestrator.delegators && obj.thisOrchestrator.delegator) {
      delegators = obj.thisOrchestrator.delegators;
      selfStake = parseFloat(obj.thisOrchestrator.delegator.bondedAmount);
      selfStakeRatio = ((selfStake / totalStake) * 100).toFixed(2);
      selfStake = selfStake.toFixed(2);
    }
  }

  return (
    <div className="hostInfo" style={{ margin: 0, padding: 0 }}>
      <div className="stroke" style={{ margin: 0, padding: 0 }}>
        <div className="rowAlignLeft">
          <h3>Orchestrator Info</h3>
        </div>
        <div className="rowAlignLeft">
          <p>Reward Cut {rewardCut}%</p>
          <p>Fee Cut {feeCut}%</p>
        </div>
        <div className="rowAlignLeft">
          <p>Total Stake {totalStake} LPT</p>
        </div>
        <div className="rowAlignLeft">
          <p>Self stake {selfStake} LPT ({selfStakeRatio}%)</p>
        </div>
        <div className="rowAlignLeft">
          <p>Earned fees {totalVolumeETH} Eth (${totalVolumeUSD})</p>
        </div>
        {
          delegators.map((delObj, idx) => {
            return (
              <div className="rowAlignLeft">
                <a href={"https://explorer.livepeer.org/accounts/" + delObj.id}>
                  <img alt="" src="livepeer.png" width="30" height="30" />
                </a>
                <p>{parseFloat(delObj.bondedAmount).toFixed(2)} LPT since round {delObj.startRound}</p>
              </div>
            )
          })
        }
      </div>
    </div>
  )
}

export default Orchestrator;