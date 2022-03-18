import React, { useState } from "react";
import { useSelector } from 'react-redux';
import { getEnsInfo } from "../actions/livepeer";
import {
  getOrchestratorInfo
} from "../actions/livepeer";

const Address = (obj) => {
  const livepeer = useSelector((state) => state.livepeerstate);
  const [hasRefreshed, setRefresh] = useState(false);
  let thisDomain = null;
  let thisInfo = null;
  const now = new Date().getTime();
  // Lookup domain in cache
  if (livepeer.ensDomainMapping){
      for (const thisAddr of livepeer.ensDomainMapping) {
        if (thisAddr.address === obj.address) {
          thisDomain = thisAddr;
          // Check timeout
        if (now - thisAddr.timestamp < 86400000) {
          break;
        }
        // Is outdated
        if (!hasRefreshed) {
          getEnsInfo(obj.address);
          setRefresh(true);
        }
      }
    }
    // If it was not cached at all
    if (thisDomain == null && !hasRefreshed) {
      setRefresh(true);
      getEnsInfo(obj.address);
    }
  }
  // Lookup current info in cache only if this addr has a mapped ENS domain
  if (thisDomain && thisDomain.domain) {
    for (const thisAddr of livepeer.ensInfoMapping) {
      if (thisAddr.domain === thisDomain.domain) {
        thisInfo = thisAddr;
        // Check timeout
        if (now - thisAddr.timestamp < 86400000) {
          break;
        }
        // Is outdated
        if (!hasRefreshed) {
          getEnsInfo(obj.address);
          setRefresh(true);
        }
      }
    }
    // If it was not cached at all
    if (thisInfo == null && !hasRefreshed) {
      getEnsInfo(obj.address);
      setRefresh(true);
    }
  }

  let thisName;
  let thisIcon;
  if (thisInfo) {
    thisName = thisInfo.domain;
    if (thisInfo.avatar) {
      thisIcon =
        <a className="selectOrchLight" style={{cursor: 'alias'}} target="_blank" rel="noopener noreferrer" href={"https://app.ens.domains/name/" + thisInfo.domain + "/details"} >
          <div className="rowAlignLeft">
            <img alt="" src={thisInfo.avatar} width="20" height="20" />
          </div>
        </a >
    } else {
      thisIcon =
        <a className="selectOrchLight" style={{cursor: 'alias'}} target="_blank" rel="noopener noreferrer" href={"https://app.ens.domains/name/" + thisInfo.domain + "/details"} >
          <div className="rowAlignLeft">
            <img alt="" src="ens.png" width="20" height="20" />
          </div>
        </a >
    }
  } else {
    thisName = obj.address;
    thisIcon = null;
  }

  return (
    <div className="rowAlignLeft">
      <a className="selectOrchLight" style={{cursor: 'alias'}} target="_blank" rel="noopener noreferrer" href={"https://explorer.livepeer.org/accounts/" + obj.address} >
        <div className="rowAlignLeft">
          <img alt="" src="livepeer.png" width="20" height="20" />
        </div>
      </a>
      {thisIcon}
      <span className="elipsText elipsOnMobile">{thisName}</span>
    </div>
  )
}

export default Address;