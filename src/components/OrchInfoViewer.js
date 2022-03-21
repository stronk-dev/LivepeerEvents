import React from "react";
import Stat from "./statViewer";
import Address from "./OrchAddressViewer";
import { useSelector } from 'react-redux';

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

const OrchInfoViewer = (obj) => {
  const livepeer = useSelector((state) => state.livepeerstate);
  let rewardCut = 0;
  let feeCut = 0;
  let totalStake = 0;
  let totalVolumeETH = 0;
  let totalVolumeUSD = 0;
  let selfStake = 0;
  let selfStakeRatio = 0;
  let thisUrl = "";
  let thisID = "";
  if (obj.totalStake && obj.totalStake > 0) {
    if (obj.rewardCut) {
      rewardCut = (obj.rewardCut / 10000).toFixed(2);
    }
    if (obj.feeShare) {
      feeCut = (100 - (obj.feeShare / 10000)).toFixed(2);
    }
    if (obj.totalStake) {
      totalStake = parseFloat(obj.totalStake).toFixed(2);
    }
    if (obj.totalVolumeETH) {
      totalVolumeETH = parseFloat(obj.totalVolumeETH * 1).toFixed(4);
    }
    if (obj.totalVolumeUSD) {
      totalVolumeUSD = parseFloat(obj.totalVolumeUSD * 1).toFixed(2);
    }
    if (obj.delegator) {
      selfStake = parseFloat(obj.delegator.bondedAmount);
      selfStakeRatio = ((selfStake / totalStake) * 100).toFixed(2);
      selfStake = selfStake.toFixed(2);
      thisID = obj.delegator.id;
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

    let thisDomain = null;
    let thisInfo = null;
    // Lookup domain in cache
    if (livepeer.ensDomainMapping) {
      for (const thisAddr of livepeer.ensDomainMapping) {
        if (thisAddr.address === thisID) {
          thisDomain = thisAddr;
          break;
        }
      }
    }
    // Lookup current info in cache only if this addr has a mapped ENS domain
    if (thisDomain && thisDomain.domain) {
      for (const thisAddr of livepeer.ensInfoMapping) {
        if (thisAddr.domain === thisDomain.domain) {
          thisInfo = thisAddr;
          break;
        }
      }
    }
    let ensDescription;
    let ensUrl;
    if (thisInfo) {
      if (thisInfo.description) {
        ensDescription =
          <div className="row">
            <span>{thisInfo.description}</span>
          </div>
      }
      if (thisInfo.url) {
        if (!thisInfo.url.startsWith('http')){
          thisInfo.url = "https://" + thisInfo.url;
        }
        ensUrl =
          <a className="selectOrchLight" style={{ cursor: 'alias' }} target="_blank" rel="noopener noreferrer" href={thisInfo.url} >
            <div className="rowAlignLeft">
              <span>{thisInfo.url}</span>
            </div>
          </a >
      }
    }

    return (
      <div className="row">
        <div className="stroke sideMargin">
          <div className="verticalDivider" />
          <div className="row">
            <h3 >Orchestrator Info</h3>
          </div>
          <div className="row">
            <Address address={thisID} />
          </div>
          {ensUrl}
          {ensDescription}
          <div className="stretchAndBetween" style={{ borderTop: '2px solid rgba(15,15,15,0.05)', marginTop: '0.2em' }} >
            <Stat header={"Earned Fees"} content1={totalVolumeETH + " Eth"} content2={"$" + totalVolumeUSD} />
          </div>
          <div className="stretchAndBetween" >
            <Stat header={"Commission"} title1={"Reward"} content1={rewardCut + "%"} title2={"Fee"} content2={feeCut + "%"} />
          </div>
          <div className="stretchAndBetween" >
            <Stat header={"Stake"} title1={"Total"} content1={totalStake + " LPT"} title2={"Self"} content2={selfStake + " LPT (" + selfStakeRatio + ")%"} />
          </div>
          <div className="stretchAndBetween strokeSmollLeft">
            <button className="selectOrchLight" onClick={() => {
              copyLink(shareUrl);
            }}>
              <img alt="" src="clipboard.svg" width="20em" height="20em" />
            </button>
          </div>
        </div>
        <div className="verticalDivider" />
      </div>
    )
  }
  return (
    <div className="stroke stretchAndBetween sideMargin">
      <div className="verticalDivider" />
      <div className="stretchAndBetween sideMargin" >
        <h3 >The selected Orchestrator is currently inactive</h3>
      </div>
      <div className="verticalDivider" />
    </div>
  )
}

export default OrchInfoViewer;