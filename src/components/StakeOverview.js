import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { VictoryPie } from 'victory';
import Address from '../components/OrchAddressViewer';
import {
  getOrchestratorScores
} from "../actions/livepeer";

const StakeOverview = (obj) => {
  const livepeer = useSelector((state) => state.livepeerstate);
  const dispatch = useDispatch();
  const [thisScores, setThisScores] = useState(null);
  const [removeOnlyStakers, setRemoveOnlyStakers] = useState(false);

  useEffect(() => {
    const now = new Date().getTime();
    let wasInCache = false;
    // See if it is cached
    for (const thisScore of livepeer.orchScores) {
      if (thisScore.year === obj.year && thisScore.month === obj.month) {
        // Check timeout
        if (now - thisScore.timestamp < 360000) {
          wasInCache = true;
        }
        if (!thisScores) {
          setThisScores(thisScore);
        }
      }
    }
    if (!wasInCache) {
      dispatch(getOrchestratorScores(obj.year, obj.month));
    }
  }, [livepeer.orchScores]);

  const getName = (address) => {
    let thisDomain = null;
    // Lookup domain in cache
    if (livepeer.ensDomainMapping) {
      for (const thisAddr of livepeer.ensDomainMapping) {
        if (thisAddr.address === address) {
          thisDomain = thisAddr;
          break;
        }
      }
    }
    // Lookup current info in cache only if this addr has a mapped ENS domain
    if (thisDomain && thisDomain.domain) {
      for (const thisAddr of livepeer.ensInfoMapping) {
        if (thisAddr.domain === thisDomain.domain) {
          return thisAddr.domain;
        }
      }
    }

    if (livepeer.threeBoxInfo) {
      for (const thisAddr of livepeer.threeBoxInfo) {
        if (thisAddr.address === address) {
          if (thisAddr.name) {
            return thisAddr.name;
          } else {
            return (address.substring(0, 10) + "..");
          }
          break;
        }
      }
    }

    return (address.substring(0, 10) + "..");
  }

  let orchList = [];
  let pieList = [];
  let otherSum = 0;
  let pieObj = null;
  if (livepeer.orchInfo) {
    let orchIdx = livepeer.orchInfo.length - 1;
    // calc sum of stake
    let totalStake = 0;
    while (orchIdx >= 0) {
      const thisOrch = livepeer.orchInfo[orchIdx];
      orchIdx -= 1;
      if (removeOnlyStakers && !parseInt(thisOrch.totalVolumeUSD)) {
        continue;
      }
      totalStake += parseInt(thisOrch.totalStake);
    }
    // create slices
    orchIdx = livepeer.orchInfo.length - 1;
    while (orchIdx >= 0) {
      const thisOrch = livepeer.orchInfo[orchIdx];
      const thisStake = parseInt(thisOrch.totalStake);
      orchIdx -= 1;
      if (removeOnlyStakers && !parseInt(thisOrch.totalVolumeUSD)) {
        continue;
      }
      // Add orch stat descending
      let idx = orchList.length - 1;
      while (idx >= 0) {
        const sel = orchList[idx];
        if (sel.sum < thisStake) {
          idx--;
          continue;
        } else {
          break;
        }
      }
      if (idx == orchList.length - 1) {
        orchList.push({
          address: thisOrch.id,
          sum: thisStake,
          ratio: (thisStake / totalStake) * 100
        });
      } else {
        orchList.splice(idx + 1, 0, {
          address: thisOrch.id,
          sum: thisStake,
          ratio: (thisStake / totalStake) * 100
        });
      }
      // Add slice
      if ((thisStake / totalStake) < 0.04) {
        otherSum += thisStake;
      } else {
        pieList.push({
          address: getName(thisOrch.id),
          sum: thisStake
        });
      }
    }
    pieList.push({
      address: "Other",
      sum: otherSum
    });
    pieObj = <div className="stroke">
      <h4>Active Orchestrators by Stake</h4>
      <div className='row'>
        <p>Only Transcoding?</p>
        <div className="toggle-container" onClick={() => setRemoveOnlyStakers(!removeOnlyStakers)}>
          <div className={`dialog-button ${removeOnlyStakers ? "" : "disabled"}`}>
            {removeOnlyStakers ? "1" : "0"}
          </div>
        </div>
      </div>
      <VictoryPie padding={100} data={pieList} x="address" y="sum"
        sortOrder="descending"
        sortKey="sum"
        colorScale={[
          "#003f5c",
          "#2f4b7c",
          "#665191",
          "#ff7c43",
          "#ffa600",
          "#5c3446",
          "#83424e",
          "#a6544e",
          "#c16d46",
          "#d18d3c",
          "#d3b136",
          "#c5d843",
          "#a3ff69",
        ]}
        style={{
          data: {
            fillOpacity: 0.9, stroke: "#636363", strokeWidth: 2
          },
          labels: {
            fontSize: 10, zIndex: 999
          }
        }} />
    </div>
  }


  return (
    <div className="stroke">
      {pieObj}
      <div className="flexContainer forceWrap">
        {
          orchList.map(function (orch) {
            return (
              <div className="row" key={"staker" + orch.address + orch.sum}>
                <div className="rowAlignLeft">
                  <Address address={orch.address} seed={"stake" + orch.address + orch.sum} />
                </div>
                <div className="strokeSmollLeft" style={{ minWidth: '100px' }} >
                  <div className="rowAlignLeft" >
                    <h4>{orch.sum.toFixed(2)} LPT</h4>
                  </div>
                  <div className="rowAlignRight" >
                    <span>({orch.ratio.toFixed(2)} %)</span>
                  </div>
                </div>
              </div>
            )
          })
        }
      </div>
      <div className="verticalDivider" />
    </div>
  )
}

export default StakeOverview;