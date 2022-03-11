import React from "react";
import ScrollContainer from "react-indiana-drag-scroll";
import Stat from "./statViewer";
import ReactTooltip from "react-tooltip";
import Address from "./OrchAddressViewer";
import OrchDelegatorViewer from "./OrchDelegatorViewer";
import OrchInfoViewer from "./OrchInfoViewer";

function updateClipboard(newClip) {
  navigator.clipboard.writeText(newClip).then(
    () => {
      console.log("Copied!");
    },
    () => {
      console.log("Copy failed!");
    }
  );
}

function copyLink(addr) {
  navigator.permissions
    .query({ name: "clipboard-write" })
    .then((result) => {
      if (result.state === "granted" || result.state === "prompt") {
        updateClipboard(addr);
      }
    });
}

const Orchestrator = (obj) => {
  if (obj.thisOrchestrator) {
    if (obj.forceVertical) {
      return (
        <div className="hostInfo">
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
    }else{
      return (
        <div className="hostInfo">
          <div className="flexContainer" style={{ justifyContent: 'flex-start', alignItems: 'flex-start' }}>
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
        <div className="flexContainer" style={{ alignItems: 'center', flexDirection: 'column' }}>
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
        <div className="flexContainer" style={{ alignItems: 'center' }}>
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