import React, { useState } from "react";
import {
  getOrchestratorInfo
} from "../actions/livepeer";
import { useDispatch, useSelector } from 'react-redux';
import { getEnsInfo } from "../actions/livepeer";

const EventButtonAddress = (obj) => {
  const dispatch = useDispatch();
  const livepeer = useSelector((state) => state.livepeerstate);
  const [hasRefreshed, setRefresh] = useState(false);
  let thisDomain = null;
  let thisInfo = null;
  const now = new Date().getTime();
  // Lookup domain in cache
  if (livepeer.ensDomainMapping) {
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
    thisName = <h4 className="elipsText elipsOnMobileExtra">{thisInfo.domain}</h4>;
    if (thisInfo.avatar) {
      thisIcon =
        <a className="selectOrch" style={{ cursor: 'alias' }} target="_blank" rel="noopener noreferrer" href={"https://app.ens.domains/name/" + thisInfo.domain + "/details"} >
          <img alt="" src={thisInfo.avatar} width="20em" height="20em" style={{ margin: 0 }} />
        </a >
    } else {
      thisIcon =
        <a className="selectOrch" style={{ cursor: 'alias' }} target="_blank" rel="noopener noreferrer" href={"https://app.ens.domains/name/" + thisInfo.domain + "/details"} >
          <img alt="" src="ens.png" width="20em" height="20em" style={{ margin: 0 }} />
        </a >
    }
  } else {
    thisName = <span className="elipsText elipsOnMobileExtra">{obj.address}</span>;
    thisIcon = null;
  }

  return (
    <div className="rowAlignLeft" style={{ width: '100%' }}>
      {thisIcon}
      <a className="selectOrch" style={{ cursor: 'alias' }} rel="noopener noreferrer" target="_blank" href={"https://explorer.livepeer.org/accounts/" + obj.address}>
        <img alt="" src="livepeer.png" width="20em" height="20em" style={{ margin: 0 }} />
      </a>
      <button className="selectOrch" style={{ padding: '0.5em', cursor: 'pointer' }} onClick={() => { obj.setSearchTerm(obj.address) }} >
        <span className="elipsText">🔎</span>
      </button>
      <span>{obj.name}</span>
      <button className="selectOrch" style={{ padding: '0.5em', cursor: 'help' }} onClick={() => { dispatch(getOrchestratorInfo(obj.address)) }} >
        {thisName}
      </button>
    </div>
  )
}

export default EventButtonAddress;