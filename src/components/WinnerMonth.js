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
    for (const thisScore of obj.data.testScores) {
      if (thisScore.year === obj.data.year && thisScore.month === obj.data.month) {
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
      dispatch(getAllMonthlyStats());
    }
  }, []);

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

  // Show all orchs (if latestTotalStake exists) or show only those in winningTicketsReceived
  let orchList;

  // Pies for stake overview, if have stake data for that month saved
  let stakeObj;
  let totalStakeSum = 0;
  if (obj.data.latestTotalStake && obj.data.latestTotalStake.length) {
    orchList = obj.data.latestTotalStake;
    let pieList = [];
    let otherSum = 0;
    let ticketIdx = obj.data.latestTotalStake.length - 1;
    // Calc total stake at that time
    while (ticketIdx >= 0) {
      const thisTicket = obj.data.latestTotalStake[ticketIdx];
      ticketIdx -= 1;
      totalStakeSum += thisTicket.totalStake;
    }
    ticketIdx = obj.data.latestTotalStake.length - 1;
    // Create pie chart
    while (ticketIdx >= 0) {
      const thisTicket = obj.data.latestTotalStake[ticketIdx];
      ticketIdx -= 1;
      if ((thisTicket.totalStake / totalStakeSum) < 0.04) {
        otherSum += thisTicket.totalStake;
      } else {
        pieList.push({
          address: getName(thisTicket.address),
          sum: thisTicket.totalStake
        });
      }
    }
    pieList.push({
      address: "Other",
      sum: otherSum
    });

    stakeObj = <div className="stroke">
      <h4>Stake Distribution</h4>
      <div className="row">
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
    </div>;
  } else {
    orchList = obj.data.winningTicketsReceived;
  }

  // Pies for earnings overview
  let earningsObj;
  if (obj.data.winningTicketsReceived && obj.data.winningTicketsReceived.length) {
    let otherSum = 0;
    let pieList = [];
    let ticketIdx = obj.data.winningTicketsReceived.length - 1;
    // Create pie chart
    while (ticketIdx >= 0) {
      const thisTicket = obj.data.winningTicketsReceived[ticketIdx];
      ticketIdx -= 1;
      if ((thisTicket.sum / obj.data.winningTicketsReceivedSum) < 0.04) {
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

    stakeObj = <div className="stroke">
      <h4>Stake Distribution</h4>
      <div className="row">
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
    </div>;
  }

  return (
    <div className="stroke">
      {stakeObj}
      {earningsObj}
      {obj.data.reactivationCount ?
        <div className="row">
          <p className="darkText">{obj.data.reactivationCount} Orchestrator reactivated</p>
        </div> : null
      }
      {obj.data.activationCount ?
        <div className="row">
          <p className="darkText">{obj.data.activationCount} Orchestrator activated with an initial stake of {obj.data.activationInitialSum} LPT</p>
        </div> : null
      }
      {obj.data.unbondCount ?
        <div className="row">
          <p className="darkText">{obj.data.unbondCount} delegators unbonded {obj.data.unbondStakeSum} LPT</p>
        </div> : null
      }
      {obj.data.rewardCount ?
        <div className="row">
          <p className="darkText">{obj.data.rewardCount} reward calls were made worth {obj.data.rewardAmountSum} LPT</p>
        </div> : null
      }
      {obj.data.claimCount ?
        <div className="row">
          <p className="darkText">{obj.data.claimCount} reward claims were made worth {obj.data.claimRewardSum} LPT and {obj.data.claimFeeSum} ETH</p>
        </div> : null
      }
      {obj.data.withdrawStakeCount ?
        <div className="row">
          <p className="darkText">{obj.data.withdrawStakeCount} withdraw stake calls were made worth {obj.data.withdrawStakeAmountSum} LPT</p>
        </div> : null
      }
      {obj.data.withdrawFeesCount ?
        <div className="row">
          <p className="darkText">{obj.data.withdrawFeesCount} withdraw fees calls were made worth {obj.data.withdrawFeesAmountSum} ETH</p>
        </div> : null
      }
      {obj.data.bondCount ?
        <div className="row">
          <p className="darkText">{obj.data.bondCount} delegators delegated their first stake worth {obj.data.bondStakeSum} LPT</p>
        </div> : null
      }
      {obj.data.moveStakeCount ?
        <div className="row">
          <p className="darkText">Stake got moved around {obj.data.moveStakeCount} times worth {obj.data.moveStakeSum} LPT</p>
        </div> : null
      }
      {obj.data.winningTicketsReceivedCount ?
        <div className="row">
          <p className="darkText">{obj.data.winningTicketsReceivedCount} winning tickets were sent out worth {obj.data.winningTicketsReceivedSum} ETH</p>
        </div> : null
      }
      {obj.data.winningTicketsRedeemedCount ?
        <div className="row">
          <p className="darkText">{obj.data.winningTicketsRedeemedCount} winning tickets were redeemed worth {obj.data.winningTicketsRedeemedSum} ETH</p>
        </div> : null
      }
      <div className="flexContainer forceWrap">
        {
          orchList.map(function (orch, i) {
            let thisCommission = null;
            let thisStake = null;
            let thisEarnings = null;
            for (const obj in obj.data.winningTicketsReceived) {
              if (obj.address == orch.address){
                thisEarnings = obj;
              }
            }
            for (const obj in obj.data.latestCommission) {
              if (obj.address == orch.address){
                thisCommission = obj;
              }
            }
            for (const obj in obj.data.latestTotalStake) {
              if (obj.address == orch.address){
                thisStake = obj;
              }
            }
            return (<Winner
              thisScore={thisScores[obj.address]}
              totalEarnings={obj.data.winningTicketsReceivedSum}
              thisEarnings={thisEarnings}
              totalStake={totalStakeSum}
              thisStake={thisStake}
              thisCommission={thisCommission}
              address={orch.address} 
              key={orch.address + i}
              seed={"win" + orch.address + i}
            />)
          })
        }
      </div>
      <div className="verticalDivider" />
    </div>
  )
}

export default WinnerMonth;