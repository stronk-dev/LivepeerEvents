import React, { useState } from "react";
import {
  getOrchestratorInfo, getEnsInfo, getThreeBoxInfo
} from "../actions/livepeer";
import { useDispatch, useSelector } from 'react-redux';

const EventButtonAddress = (obj) => {
  const dispatch = useDispatch();
  const livepeer = useSelector((state) => state.livepeerstate);
  const [hasRefreshed, setRefresh] = useState(false);
  const [hasThreeBoxRefreshed, setThreeBoxRefresh] = useState(false);
  let thisDomain = null;
  let thisInfo = null;
  let hasENS = false;
  let hasThreeBox = false;
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
        break;
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
        hasENS = true;
        // Check timeout
        if (now - thisAddr.timestamp < 86400000) {
          break;
        }
        // Is outdated
        if (!hasRefreshed) {
          getEnsInfo(obj.address);
          setRefresh(true);
        }
        break;
      }
    }
    // If it was not cached at all
    if (thisInfo == null && !hasRefreshed) {
      getEnsInfo(obj.address);
      setRefresh(true);
    }
  }

  // Ugly shit, but temporary for now to quickly enable threebox. Sorry!
  if (!hasENS) {
    if (livepeer.threeBoxInfo) {
      for (const thisAddr of livepeer.threeBoxInfo) {
        if (thisAddr.address === obj.address) {
          thisInfo = thisAddr;
          hasThreeBox = true;
          // Check timeout
          if (now - thisAddr.timestamp < 86400000) {
            break;
          }
          // Is outdated
          if (!hasThreeBoxRefreshed) {
            getThreeBoxInfo(obj.address);
            setThreeBoxRefresh(true);
          }
          break;
        }
      }
      // If it was not cached at all
      if (thisDomain == null && !hasThreeBoxRefreshed) {
        setThreeBoxRefresh(true);
        getThreeBoxInfo(obj.address);
      }
    }
  }

  let thisName;
  let thisIcon;
  if (hasENS) {
    thisName = <h4 className="elipsText elipsOnMobileExtra">{thisInfo.domain}</h4>;
    if (thisInfo.avatar) {
      thisIcon =
        <a className="selectOrch" style={{ padding: '0', cursor: 'alias' }} target="_blank" rel="noopener noreferrer" href={"https://app.ens.domains/name/" + thisInfo.domain + "/details"} >
          <img alt="" src={thisInfo.avatar.url} width="20em" height="20em" style={{ margin: 0, padding: 0 }} />
        </a >
    }
  } else if (hasThreeBox) {
    if (thisInfo.name) {
      thisName = <h4 className="elipsText elipsOnMobileExtra">{thisInfo.name}</h4>;
    } else {
      thisName = <span className="elipsText elipsOnMobileExtra">{obj.address}</span>;
    }
    if (thisInfo.image) {
      thisIcon = <img alt="" src={"https://cloudflare-ipfs.com/ipfs/" + thisInfo.image} width="20em" height="20em" style={{ margin: 0, padding: 0 }} />
    } else {
      thisIcon = null;
    }
  } else {
    thisName = <span className="elipsText elipsOnMobileExtra">{obj.address}</span>;
    thisIcon = null;
  }


  return (
    <div className="rowAlignLeft" style={{ width: '100%' }}>
      <a className="selectOrch" style={{ padding: '0.2em', cursor: 'alias' }} rel="noopener noreferrer" target="_blank" href={"https://explorer.livepeer.org/accounts/" + obj.address}>
        <img alt="" src="livepeer.png" width="20em" height="20em" style={{ margin: 0 }} />
      </a>
      <button className="selectOrch" style={{ padding: '0.5em', cursor: 'pointer' }} onClick={() => { obj.setSearchTerm(obj.address) }} >
        <span className="elipsText">🔎</span>
      </button>
      <span>{obj.name}</span>
      {thisIcon}
      <button className="selectOrch" style={{ padding: '0.5em', cursor: 'help' }} onClick={() => { dispatch(getOrchestratorInfo(obj.address)) }} >
        {thisName}
      </button>
    </div>
  )
}

export default EventButtonAddress;