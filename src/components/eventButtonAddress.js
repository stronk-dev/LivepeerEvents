import React, { useEffect, useState } from "react";
import {
  getOrchestratorInfo, getEnsInfo, setCachedOrch, getOrchestratorInfoSilent
} from "../actions/livepeer";
import { useDispatch, useSelector } from 'react-redux';
import { Text } from '@mantine/core';

const EventButtonAddress = (obj) => {
  const dispatch = useDispatch();
  const livepeer = useSelector((state) => state.livepeerstate);
  const [hasRefreshed, setRefresh] = useState(false);
  const [orchInfo, setOrchInfo] = useState(null);
  const now = new Date().getTime();

  useEffect(() => {
    let thisInfo = null;
    let thisDomain = null;
    let hasENS = null;
    // Lookup domain in cache
    if (livepeer.ensDomainMapping && !hasRefreshed) {
      for (const thisAddr of livepeer.ensDomainMapping) {
        if (thisAddr.address === obj.address) {
          thisDomain = thisAddr;
          // Check timeout
          if (now - thisAddr.timestamp < 86400000) {
            break;
          }
          // Is outdated
          if (!hasRefreshed) {
            console.log("Refresh due to old ENS domain");
            getEnsInfo(obj.address);
            setRefresh(true);
          }
          break;
        }
      }
      // If it was not cached at all
      if (thisDomain == null && !hasRefreshed) {
        console.log("Refresh due to non-existing ENS domain");
        setRefresh(true);
        getEnsInfo(obj.address);
      }
    }
    // Lookup current info in cache only if this addr has a mapped ENS domain
    if (livepeer.ensInfoMapping && thisDomain && thisDomain.domain && !hasRefreshed) {
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
            console.log("Refresh due to old ENS info");
            getEnsInfo(obj.address);
            setRefresh(true);
          }
          break;
        }
      }
      // If it was not cached at all
      if (thisInfo == null && !hasRefreshed) {
        console.log("Refresh due to non-existing ENS info");
        getEnsInfo(obj.address);
        setRefresh(true);
      }
    }
    if (thisInfo && thisInfo != orchInfo) {
      console.log("Setting INFO obj");
      setOrchInfo(thisInfo);
    }
  }, [livepeer.ensDomainMapping]);

  useEffect(() => {
    // Check if cached as an orchestrator
    let shouldUpdate = false;
    if (livepeer.orchInfo) {
      for (const thisOrch of livepeer.orchInfo) {
        if (thisOrch.id === obj.address) {
          return;
        }
      }
      shouldUpdate = true;
    }
    if (livepeer.delInfo) {
      for (const thisOrch of livepeer.delInfo) {
        if (thisOrch.id === obj.address) {
          return;
        }
      }
      shouldUpdate = true;
    }
    // Preload Orch info
    if (shouldUpdate) {
      console.log("Refresh due to non-existing orch in global state");
      getOrchestratorInfoSilent(obj.address);
    }
  }, [livepeer.orchInfo]);

  let thisName;
  let thisIcon;
  if (orchInfo && orchInfo.domain) {
    thisName = <Text style={{ textOverflow: "ellipsis", overflow: "hidden", width: '100%' }} >{orchInfo.domain}</Text>;
    if (orchInfo.avatar) {
      thisIcon =
        <a className="selectOrch" style={{ padding: '0.3em', cursor: 'alias' }} target="_blank" rel="noopener noreferrer" href={"https://app.ens.domains/name/" + orchInfo.domain + "/details"} >
          <img alt="" src={orchInfo.avatar.url} width="20em" height="20em" style={{ margin: 0, padding: 0 }} />
        </a >
    }
  } else {
    thisName = <Text style={{ textOverflow: "ellipsis", overflow: "hidden", width: '100%', maxWidth: '10vw' }} >{obj.address}</Text>;
    thisIcon = null;
  }


  return (
    <div className="rowAlignLeft" style={{
      width: '100%', display: 'flex', padding: 0, margin: 0,
      justifyContent: 'spaceAround',
      flexFlow: 'row wrap',
      alignItems: 'stretch'
    }}>
      <a className="selectOrch" style={{ padding: '0.3em', cursor: 'alias' }} rel="noopener noreferrer" target="_blank" href={"https://explorer.livepeer.org/accounts/" + obj.address}>
        <img alt="" src="livepeer.png" width="20em" height="20em" style={{ margin: 0 }} />
      </a>
      <button className="selectOrch" style={{ padding: '0.3em', cursor: 'pointer' }} onClick={() => { obj.setSearchTerm(obj.address) }} >
        <span style={{ margin: 0 }}>🔎</span>
      </button>
      {thisIcon}
      <button className="selectOrch" style={{ padding: '0.3em', cursor: 'help', flex: 1, flexGrow: 3 }} onClick={() => {
        // Check if cached as an orchestrator
        if (livepeer.orchInfo) {
          for (const thisOrch of livepeer.orchInfo) {
            if (thisOrch.id === obj.address) {
              const now = new Date().getTime();
              if (now - thisOrch.lastGet < 120000) {
                dispatch(setCachedOrch(thisOrch));
                return;
              }
              break;
            }
          }
        }
        dispatch(getOrchestratorInfo(obj.address));
      }} >
        <div className="row">
          <span>{obj.name}</span> {thisName}
        </div>
      </button>

    </div>
  )
}

export default EventButtonAddress;