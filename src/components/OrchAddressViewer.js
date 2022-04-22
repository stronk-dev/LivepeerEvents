import React, { useState } from "react";
import { useSelector } from 'react-redux';
import { getEnsInfo } from "../actions/livepeer";

const Address = (obj) => {
  const livepeer = useSelector((state) => state.livepeerstate);
  const [hasRefreshed, setRefresh] = useState(false);
  let hasENS = false;
  let hasThreeBox = false;
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
        if (now - thisAddr.timestamp < 3600000) {
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
          break;
        }
      }
    }
  }

  let thisName;
  let thisIcon;
  if (hasENS) {
    thisName = thisInfo.domain;
    if (thisInfo.avatar) {
      thisIcon =
        <a className="selectOrchLight" style={{ marginRight: '0.2em', cursor: 'alias' }} target="_blank" rel="noopener noreferrer" href={"https://app.ens.domains/name/" + thisInfo.domain + "/details"} >
          <img alt="" src={thisInfo.avatar.url} width="20em" height="20em" style={{ margin: '0.2em', padding: '0.2em' }} />
        </a >
    } else {
      thisIcon =
        <a className="selectOrchLight" style={{ marginRight: '0.2em', cursor: 'alias' }} target="_blank" rel="noopener noreferrer" href={"https://app.ens.domains/name/" + thisInfo.domain + "/details"} >
          <img alt="" src="ens.png" width="20em" height="20em" style={{ margin: '0.2em', padding: '0.2em' }} />
        </a >
    }
  } else if (hasThreeBox) {
    if (thisInfo.name) {
      thisName = <h4 className="elipsText elipsOnMobileExtra">{thisInfo.name}</h4>;
    } else {
      thisName = <span className="elipsText elipsOnMobileExtra">{obj.address}</span>;
    }
    if (thisInfo.image) {
      thisIcon =
        <a className="selectOrch" style={{ marginRight: '0.5em', cursor: 'grab' }} disabled>
          <img alt="" src={"https://cloudflare-ipfs.com/ipfs/" + thisInfo.image} width="20em" height="20em" style={{ margin: 0, padding: 0 }} />
        </a >
    } else {
      thisIcon = null;
    }
  } else {
    thisName = obj.address;
    thisIcon = null;
  }

  return (
    <div className="row" style={{ width: 'unset' }}>
      <a className="selectOrchLight" style={{ padding: '0.2em', cursor: 'alias' }} target="_blank" rel="noopener noreferrer" href={"https://explorer.livepeer.org/accounts/" + obj.address} >
        <img alt="" src="livepeer.png" width="20em" height="20em" />
      </a>
      {thisIcon}
      <span className="elipsText elipsOnMobileExtra" style={{ width: '100%' }}>{thisName}</span>
    </div>
  )
}

export default Address;