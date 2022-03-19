import React from "react";
import OrchDelegatorViewer from "./OrchDelegatorViewer";
import OrchInfoViewer from "./OrchInfoViewer";

const Orchestrator = (obj) => {
  if (obj.thisOrchestrator) {
    if (obj.forceVertical) {
      return (
        <div className="hostInfo sideMargin">
          <div className="flexContainer" style={{ justifyContent: 'flex-start', alignItems: 'flex-start', flexDirection: 'column' }}>
            <OrchInfoViewer
              rewardCut={obj.thisOrchestrator.rewardCut}
              feeShare={obj.thisOrchestrator.feeShare}
              totalStake={obj.thisOrchestrator.totalStake}
              totalVolumeETH={obj.thisOrchestrator.totalVolumeETH}
              totalVolumeUSD={obj.thisOrchestrator.totalVolumeUSD}
              delegator={obj.thisOrchestrator.delegator}
            />
            <OrchDelegatorViewer delegators={obj.thisOrchestrator.delegators} />
          </div>
        </div>
      )
    } else {
      return (
        <div className="hostInfo sideMargin">
          <div className="flexContainer" style={{ justifyContent: 'flex-start', alignItems: 'flex-start', flexDirection: 'column' }}>
            <OrchInfoViewer
              rewardCut={obj.thisOrchestrator.rewardCut}
              feeShare={obj.thisOrchestrator.feeShare}
              totalStake={obj.thisOrchestrator.totalStake}
              totalVolumeETH={obj.thisOrchestrator.totalVolumeETH}
              totalVolumeUSD={obj.thisOrchestrator.totalVolumeUSD}
              delegator={obj.thisOrchestrator.delegator}
            />
            <OrchDelegatorViewer delegators={obj.thisOrchestrator.delegators} />
          </div>
        </div>
      )
    }
  }
  if (obj.forceVertical) {
    return (
      <div className="hostInfo">
        <div className="flexContainer fullMargin">
          <div className="rowAlignLeft">
            <img alt="" src="livepeer.png" width="30" height="30" />
            <h3>Orchestrator Info</h3>
          </div>
          <div className="rowAlignLeft">
            <p>Inspect an Orchestrator by clicking on their address</p>
          </div>
        </div>
      </div>
    )
  } else {
    return (
      <div className="hostInfo">
        <div className="flexContainer fullMargin">
          <div className="rowAlignLeft">
            <img alt="" src="livepeer.png" width="30" height="30" />
            <h3>Orchestrator Info</h3>
          </div>
          <div className="rowAlignLeft">
            <p>Inspect an Orchestrator by clicking on their address</p>
          </div>
        </div>
      </div>
    )
  }

}

export default Orchestrator;