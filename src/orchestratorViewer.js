import React from "react";
import ScrollContainer from "react-indiana-drag-scroll";
import Stat from "./statViewer";

const Orchestrator = (obj) => {
  let rewardCut = 0;
  let feeCut = 0;
  let totalStake = 0;
  let totalVolumeETH = 0;
  let totalVolumeUSD = 0;
  let delegators = [];
  let selfStake = 0;
  let selfStakeRatio = 0;
  let thisUrl = "";
  let thisID = "";
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
      thisID = obj.thisOrchestrator.delegator.id;
      thisUrl = "https://explorer.livepeer.org/accounts/" + thisID;
    }

    return (
      <div className="hostInfo">
        <div className="strokeSmollLeft" style={{ display: "flex" }}>
          <div style={{ flexDirection: 'row', display: "flex" }}>
            <a href={thisUrl}>
              <img alt="" src="livepeer.png" width="30" height="30" />
              <h3 style={{ padding: 0, margin: 0 }}>Orchestrator Info</h3>
              {thisID}
            </a>
          </div>
          <Stat header={"Earned Fees"} content={totalVolumeETH + " Eth ($" + totalVolumeUSD + ")"} />
          <Stat header={"Reward Cut"} content={rewardCut + "%"} />
          <Stat header={"Fee Cut"} content={feeCut + "%"} />
          <Stat header={"Total Stake"} content={totalStake + " LPT"} />
          <Stat header={"Self Stake"} content={selfStake + " LPT(" + selfStakeRatio + ")%"} />
        </div>
        <div className="strokeSmollLeft" style={{ alignItems: 'stretch', flex: 2, marginLeft: '1em', borderLeft: '3px solid rgba(15,15,15,0.05)' }}>
          <div className="content-wrapper">
            <ScrollContainer className="overflow-container" hideScrollbars={false}>
              <div className="overflow-content" style={{ cursor: 'grab', height: '300px' }}>
                {
                  delegators.map((delObj, idx) => {
                    return (
                      <div className="rowAlignLeft" key={"delegator" + idx} style={{ marginLeft: '1em', borderBottom: '2px solid rgba(15,15,15,0.05)' }}>
                        <a href={"https://explorer.livepeer.org/accounts/" + delObj.id}>
                          <img alt="" src="livepeer.png" width="30" height="30" />{delObj.id.substr(0, 12) + "..."}</a>
                        <div className="strokeSmollLeft">
                          <p>{parseFloat(delObj.bondedAmount).toFixed(2)} LPT since round {delObj.startRound}</p>
                        </div>
                      </div>
                    )
                  })
                }
              </div>
            </ScrollContainer>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="hostInfo">
      <div className="rowAlignLeft">
        <img alt="" src="livepeer.png" width="30" height="30" />
        <h3>Orchestrator Info</h3>
      </div>
      <div className="rowAlignLeft">
        <p>Click on an orchestrator in the list below!</p>
      </div>
    </div>
  )
}

export default Orchestrator;