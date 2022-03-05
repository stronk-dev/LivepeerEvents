import React from "react";
import ScrollContainer from "react-indiana-drag-scroll";
import Stat from "./statViewer";
import ReactTooltip from "react-tooltip";
import Address from "./OrchAddressViewer";

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

    let shareUrl;
    if (obj.rootOnly) {
      shareUrl = window.location.href;
    } else {
      let thisFullPath = window.location.href;
      if (thisFullPath.lastIndexOf("?") > -1) {
        thisFullPath = thisFullPath.substring(0, thisFullPath.lastIndexOf("?"));
      }
      shareUrl = thisFullPath + "?orchAddr=" + thisID;
    }

    return (
      <div className="hostInfo">
        <div className="strokeSmollLeft" style={{ display: "flex" }}>
          <div style={{ flexDirection: 'row', display: "flex" }} style={{ marginTop: '1em' }}>
            <a href={thisUrl}>
              <h3 style={{ padding: 0, margin: 0 }}>Orchestrator Info</h3>
              <Address address={thisID} />
            </a>
          </div>
          <div className="row" style={{}}>
            <Stat header={"Earned Fees"} content1={totalVolumeETH + " Eth"} content2={"$" + totalVolumeUSD} />
          </div>
          <div className="row" style={{}}>
            <Stat header={"Commission"}  title1={"Reward"} content1={rewardCut + "%"}  title2={"Fee"} content2={feeCut + "%"} />
          </div>
          <div className="row" style={{}}>
            <Stat header={"Stake"}  title1={"Total"} content1={totalStake + " LPT"}  title2={"Self"} content2={selfStake + " LPT (" + selfStakeRatio + ")%"} />
          </div>
          <div className="strokeSmollLeft" style={{ display: "flex" }}>
            <button style={{marginBottom:'1em'}} className="selectOrchLight" data-tip data-for="registerTip" onClick={() => {
              copyLink(shareUrl);
            }}>
              <img alt="" src="clipboard.svg" width="20em" height="20em" />
            </button>
            <ReactTooltip id="registerTip" place="top" effect="solid">
              Copy to clipboard
            </ReactTooltip>
          </div>
        </div>
        <div className="strokeSmollLeft" style={{ alignItems: 'stretch', flex: 2, marginLeft: '1em', borderLeft: '3px solid rgba(15,15,15,0.05)' }}>
          <div className="row" style={{ marginTop: '1em' }}>
            <h3 style={{ padding: 0, margin: 0 }}>{delegators.length} Current Delegators</h3>
          </div>
          <div className="content-wrapper">
            <ScrollContainer className="overflow-container" hideScrollbars={false}>
              <div className="overflow-content" style={{ cursor: 'grab' }}>
                {
                  delegators.map((delObj, idx) => {
                    return (
                      <div className="rowAlignLeft" key={"delegator" + idx} style={{ marginLeft: '1em', borderBottom: '2px solid rgba(15,15,15,0.05)' }}>
                        <Address address={delObj.id} seed={"delegator" + idx + delObj.id} />
                        <div className="rowAlignRight">
                          <p className="darkText">{parseFloat(delObj.bondedAmount).toFixed(2)} LPT since round {delObj.startRound}</p>
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
        <p>Click on an orchestrator address in the list below!</p>
      </div>
    </div>
  )
}

export default Orchestrator;