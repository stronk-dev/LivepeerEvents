import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { VictoryPie } from 'victory';
import Winner from '../components/WinnerStat';
import {
  getOrchestratorScores
} from "../actions/livepeer";

const WinnerMonth = (obj) => {
  const livepeer = useSelector((state) => state.livepeerstate);
  const dispatch = useDispatch();
  const [thisScores, setThisScores] = useState(null);

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

  let pieList = [];
  let otherSum = 0;
  let ticketIdx = obj.orchestrators.length - 1;
  while (ticketIdx >= 0) {
    const thisTicket = obj.orchestrators[ticketIdx];
    ticketIdx -= 1;
    if ((thisTicket.sum / obj.total) < 0.04) {
      otherSum += thisTicket.sum;
    } else {
      pieList.push({
        address: getName(thisTicket.address),
        sum: thisTicket.sum
      });
    }
  }
  pieList.push({
    address: "Other",
    sum: otherSum
  });


  return (
    <div className="stroke">
      <div className="row">
        <VictoryPie padding={100} data={pieList} x="address" y="sum"
          sortOrder="descending"
          sortKey = "sum"
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
      <div className="flexContainer forceWrap">
        {
          obj.orchestrators.map(function (orch) {
            return (<Winner stats={thisScores} address={orch.address} sum={orch.sum} total={obj.total} key={"delegator" + orch.address + orch.sum} />)
          })
        }
      </div>
      <div className="verticalDivider" />
    </div>
  )
}

export default WinnerMonth;