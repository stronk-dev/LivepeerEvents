import React, { useState, useEffect } from 'react';
import Stat from "./statViewer";
import Address from "./OrchAddressViewer";
import { useSelector } from 'react-redux';
import { Popover } from '@mantine/core';

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

function nl2br(str) {
  if (typeof str === "undefined" || str === null) {
    return "";
  }
  var breakTag = "<br>"; // "<br />"
  return (str + "").replace(
    /([^>\r\n]?)(\r\n|\n\r|\r|\n)/g,
    "$1" + breakTag + "$2"
  );
}

const OrchInfoViewer = (obj) => {
  const [opened, setOpened] = useState(false);
  const livepeer = useSelector((state) => state.livepeerstate);
  let hasENS = false;
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
    if (thisDomain && thisDomain.domain && livepeer.ensInfoMapping && livepeer.ensInfoMapping.length) {
      for (const thisAddr of livepeer.ensInfoMapping) {
        if (thisAddr.domain === thisDomain.domain) {
          thisInfo = thisAddr;
          hasENS = true;
          break;
        }
      }
    }

    let ensDescription;
    let ensUrl;
    if (hasENS) {
      if (thisInfo.description) {
        ensDescription = thisInfo.description
      }
      if (thisInfo.url) {
        if (!thisInfo.url.startsWith('http')) {
          thisInfo.url = "https://" + thisInfo.url;
        }
        ensUrl =
          <div className="stroke">
            <a className="selectOrchLight" style={{ cursor: 'alias' }} target="_blank" rel="noopener noreferrer" href={thisInfo.url} >
              <div className="rowAlignLeft">
                <span>{thisInfo.url}</span>
              </div>
            </a >
          </div>
      }
    }

    let descriptionObj;
    if (ensDescription) {
      if (ensDescription.length < 200) {
        descriptionObj =
          <div className="darkText" style={{ overflowWrap: 'break-word' }}
            dangerouslySetInnerHTML={{
              __html: nl2br(ensDescription),
            }}
          />
      } else {
        descriptionObj =
          <Popover className="strokeSmollLeft" style={{ cursor: 'pointer', marginTop: '0.2em', marginBottom: '0.2em' }}
            opened={opened}
            onClose={() => setOpened(false)}
            target={
              <div className="darkText" style={{ overflowWrap: 'break-word' }} onClick={() => setOpened((o) => !o)}
                dangerouslySetInnerHTML={{
                  __html: nl2br(ensDescription.substring(0, 200) + "..."),
                }}
              />
            }
            width={260}
            position="right"
            withArrow
          >
            <div className="darkText" style={{ overflowWrap: 'break-word' }}
              dangerouslySetInnerHTML={{
                __html: nl2br(ensDescription),
              }}
            />
          </Popover>
      }
    }

    return (
      <div className="row" style={{ maxWidth: '500px' }}>
        <div className="stroke sideMargin">
          <div className="verticalDivider" />
          <div className="row">
            <h3 >Orchestrator Info</h3>
          </div>
          <Address address={thisID} />
          {ensUrl}
          <div className="verticalDivider" />
          {descriptionObj}
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