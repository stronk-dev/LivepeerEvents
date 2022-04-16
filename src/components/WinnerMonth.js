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
        if (!thisScores){
          setThisScores(thisScore);
        }
      }
    }
    if (!wasInCache){
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
            return address;
          }
          break;
        }
      }
    }

    return address;
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
        address: getName(thisTicket.address).substring(0, 24),
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
        <VictoryPie padding={100} data={pieList} x="address" y="sum" colorScale="qualitative" />
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