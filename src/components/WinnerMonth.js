import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux';
import { VictoryPie } from 'victory';
import Winner from '../components/WinnerStat';
import {
  getOrchestratorScores
} from "../actions/livepeer";
import Ticket from "../components/TicketViewer";

const claimColour = "rgba(25, 158, 29, 0.4)";
const stakeColour = "rgba(25, 158, 147, 0.4)";
const ticketRedeemColour = "rgba(25, 98, 158, 0.4)";
const rewardColour = "rgba(25, 27, 158, 0.4)";
const unbondColour = "rgba(105, 25, 158, 0.4)";
const updateColour = "rgba(158, 25, 52, 0.4)";
const withdrawStakeColour = "rgba(158, 98, 25, 0.4)";
const activationColour = "rgba(154, 158, 25, 0.4)";
const ticketTransferColour = "rgba(88, 91, 42, 0.3)";
const greyColour = "rgba(122, 128, 127, 0.4)";

const WinnerMonth = (obj) => {
  const livepeer = useSelector((state) => state.livepeerstate);
  const [thisScores, setThisScores] = useState(null);

  useEffect(() => {
    const setScore = async () => {
      if (!obj.data.testScores) {
        const freshScore = await getOrchestratorScores(obj.data.year, obj.data.month);
        if (freshScore) {
          setThisScores(freshScore);
        }
      } else {
        setThisScores(obj.data.testScores);
      }
    }
    setScore();
  }, [obj.data.testScores]);

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
          if (thisAddr.domain.length > 18) {
            return (thisAddr.domain.substring(0, 16) + "..");
          }
          return thisAddr.domain;
        }
      }
    }

    if (livepeer.threeBoxInfo) {
      for (const thisAddr of livepeer.threeBoxInfo) {
        if (thisAddr.address === address) {
          if (thisAddr.name) {
            if (thisAddr.name.length > 18) {
              return (thisAddr.name.substring(0, 16) + "..");
            }
            return thisAddr.name;
          } else {
            return (address.substring(0, 16) + "..");
          }
          break;
        }
      }
    }

    return (address.substring(0, 16) + "..");
  }

  // Show all orchs (if latestTotalStake exists) or show only those in winningTicketsReceived
  let orchList;
  let ticketList = obj.data.winningTicketsReceived || [];
  let commissionList = obj.data.latestCommission || [];
  let stakeList = obj.data.latestTotalStake || [];

  // Pies for stake overview, if have stake data for that month saved
  let stakeObj;
  let totalStakeSum = 0;
  if (obj.data.latestTotalStake && obj.data.latestTotalStake.length) {
    orchList = [...obj.data.latestTotalStake];
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
      if ((thisTicket.totalStake / totalStakeSum) < 0.015) {
        otherSum += thisTicket.totalStake;
      } else {
        pieList.push({
          address: getName(thisTicket.address),
          sum: thisTicket.totalStake
        });
      }
    }
    if ((otherSum / totalStakeSum) > 0.01) {
      pieList.push({
        address: "Other",
        sum: otherSum
      });
    }

    stakeObj = <div className="stroke">
      <h4>Stake Distribution</h4>
      <VictoryPie padding={0} data={pieList} x="address" y="sum"
        sortOrder="descending"
        sortKey="sum"
        radius={300}
        width={620}
        height={620}
        innerRadius={50}
        labelRadius={130}
        cornerRadius={3}
        colorScale={[
          "#282678",
          "#56256c",
          "#872974",
          "#b63074",
          "#de416d",
          "#ff5c5f",
          "#ffe085",
          "#f0e575",
          "#daec69",
          "#bef262",
          "#97f964",
          "#5cff6f",
          "#14ff47",
          "#00fb94",
          "#00f3cd",
          "#00e7f3",
          "#00d8ff",
          "#24c8ff",
          "#0a78ff",
          "#5864d7",
          "#6952b1",
          "#69448d",
          "#61386c",
          "#522f50"
        ]}
        style={{
          backgroundColor: 'rgba(122, 128, 127, 0.4)',
          data: {
            fillOpacity: 0.9, stroke: "#636363", strokeWidth: 1.5
          },
          labels: {
            fontSize: 16, zIndex: 999
          }
        }}
        labelPosition="centroid"
        labelPlacement="parallel"
      />
    </div>;
  } else {
    orchList = [...obj.data.winningTicketsReceived];
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
      if ((thisTicket.sum / obj.data.winningTicketsReceivedSum) < 0.015) {
        otherSum += thisTicket.sum;
      } else {
        pieList.push({
          address: getName(thisTicket.address),
          sum: thisTicket.sum
        });
      }
    }
    if ((otherSum / obj.data.winningTicketsReceivedSum) > 0.01) {
      pieList.push({
        address: "Other",
        sum: otherSum
      });
    }

    earningsObj = <div className="stroke">
      <h4>Earnings Distribution</h4>
      <VictoryPie padding={{ top: 20, bottom: 20, left: 120, right: 120 }} data={pieList} x="address" y="sum"
        sortOrder="descending"
        sortKey="sum"
        radius={300}
        width={620}
        height={620}
        innerRadius={50}
        labelRadius={130}
        cornerRadius={3}
        colorScale={[
          "#282678",
          "#56256c",
          "#872974",
          "#b63074",
          "#de416d",
          "#ff5c5f",
          "#ffe085",
          "#f0e575",
          "#daec69",
          "#bef262",
          "#97f964",
          "#5cff6f",
          "#14ff47",
          "#00fb94",
          "#00f3cd",
          "#00e7f3",
          "#00d8ff",
          "#24c8ff",
          "#0a78ff",
          "#5864d7",
          "#6952b1",
          "#69448d",
          "#61386c",
          "#522f50"
        ]}
        style={{
          backgroundColor: 'rgba(122, 128, 127, 0.4)',
          data: {
            fillOpacity: 0.9, stroke: "#636363", strokeWidth: 1.5
          },
          labels: {
            fontSize: 16, zIndex: 999
          }
        }}
        labelPosition="centroid"
        labelPlacement="parallel"
      />
    </div>;
  }

  // Pies for broadcaster payout
  let broadcasterObj;
  if (obj.data.winningTicketsSent && obj.data.winningTicketsSent.length) {
    let otherSum = 0;
    let pieList = [];
    let ticketIdx = obj.data.winningTicketsSent.length - 1;
    // Create pie chart
    while (ticketIdx >= 0) {
      const thisTicket = obj.data.winningTicketsSent[ticketIdx];
      ticketIdx -= 1;
      if ((thisTicket.sum / obj.data.winningTicketsReceivedSum) < 0.015) {
        otherSum += thisTicket.sum;
      } else {
        pieList.push({
          address: getName(thisTicket.address),
          sum: thisTicket.sum
        });
      }
    }
    if ((otherSum / obj.data.winningTicketsReceivedSum) > 0.01) {
      pieList.push({
        address: "Other",
        sum: otherSum
      });
    }

    broadcasterObj = <div className="stroke">
      <h4>Broadcaster Payments</h4>
      <VictoryPie padding={{ top: 20, bottom: 20, left: 120, right: 120 }} data={pieList} x="address" y="sum"
        sortOrder="descending"
        sortKey="sum"
        radius={300}
        width={620}
        height={620}
        innerRadius={50}
        labelRadius={130}
        cornerRadius={3}
        colorScale={[
          "#282678",
          "#56256c",
          "#872974",
          "#b63074",
          "#de416d",
          "#ff5c5f",
          "#ffe085",
          "#f0e575",
          "#daec69",
          "#bef262",
          "#97f964",
          "#5cff6f",
          "#14ff47",
          "#00fb94",
          "#00f3cd",
          "#00e7f3",
          "#00d8ff",
          "#24c8ff",
          "#0a78ff",
          "#5864d7",
          "#6952b1",
          "#69448d",
          "#61386c",
          "#522f50"
        ]}
        style={{
          backgroundColor: 'rgba(122, 128, 127, 0.4)',
          data: {
            fillOpacity: 0.9, stroke: "#636363", strokeWidth: 1.5
          },
          labels: {
            fontSize: 16, zIndex: 999
          }
        }}
        labelPosition="centroid"
        labelPlacement="parallel"
      />
    </div>;
  }

  let sortedList = [];
  if (orchList.length) {
    // Sort this months data
    while (orchList.length) {
      let ticketIdx2 = orchList.length - 1;
      let largestIdx = 0;
      let largestValue = 0;

      // Find current O with most ticket wins in Eth
      while (ticketIdx2 >= 0) {
        const currentOrch = orchList[ticketIdx2];
        let thisVal;

        for (const obj of ticketList) {
          if (obj.address == currentOrch.address) {
            thisVal = obj.sum;
          }
        }

        if (!thisVal) {
          ticketIdx2 -= 1;
          continue;
        }
        if (thisVal > largestValue) {
          largestIdx = ticketIdx2;
          largestValue = thisVal;
        }
        ticketIdx2 -= 1;
      }
      // Else try to sort by stake
      if (!largestValue) {
        ticketIdx2 = orchList.length - 1;
        while (ticketIdx2 >= 0) {
          const currentOrch = orchList[ticketIdx2];
          let thisVal;

          for (const obj of stakeList) {
            if (obj.address == currentOrch.address) {
              thisVal = obj.totalStake;
            }
          }

          if (!thisVal) {
            ticketIdx2 -= 1;
            continue;
          }
          if (thisVal > largestValue) {
            largestIdx = ticketIdx2;
            largestValue = thisVal;
          }
          ticketIdx2 -= 1;
        }
      }
      // Push current biggest list
      sortedList.push(orchList[largestIdx]);
      // Remove from list
      orchList.splice(largestIdx, 1);
    }
  }

  return (
    <div className="stroke" key={obj.seed + "strok"}>
      {obj.data.reactivationCount ?
        <div className="row">
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'stretch', maxWidth: '61.8%', textAlign: 'justify', padding: '0.5em', backgroundColor: activationColour, border: '0.1em solid rgba(54, 46, 46, 0.1)' }}>
            <Ticket seed={obj.seed + "-reactivationCount-"} icon={"🔌"} subtext={obj.data.reactivationCount + " activated"} descriptions={[
              obj.data.reactivationCount + " Orchestrators reactivated"
            ]} />
          </div>
        </div> : null
      }
      <div className="halfVerticalDivider" />
      {obj.data.activationCount ?
        <div className="row">
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'stretch', maxWidth: '61.8%', textAlign: 'justify', padding: '0.5em', backgroundColor: activationColour, border: '0.1em solid rgba(54, 46, 46, 0.1)' }}>
            <Ticket seed={obj.seed + "-neworchs-"} icon={"🔧"} subtext={obj.data.activationCount + " new orchestrators"} descriptions={[
              obj.data.activationCount + " orchestrators joined with an initial stake of " + obj.data.activationInitialSum.toFixed(2) + " LPT"
            ]} />
          </div>
        </div> : null
      }
      <div className="halfVerticalDivider" />
      {obj.data.bondCount ?
        <div className="row">
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'stretch', maxWidth: '61.8%', textAlign: 'justify', padding: '0.5em', backgroundColor: stakeColour, border: '0.1em solid rgba(54, 46, 46, 0.1)' }}>
            <Ticket seed={obj.seed + "-neworchs-"} icon={"📈"} subtext={obj.data.bondCount + " new orchestrators"} descriptions={[
              obj.data.bondCount + " accounts delegated for the first time for a total of " + obj.data.bondStakeSum.toFixed(2) + " LPT"
            ]} />
          </div>
        </div> : null
      }
      <div className="halfVerticalDivider" />
      {obj.data.unbondCount ?
        <div className="row">
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'stretch', maxWidth: '61.8%', textAlign: 'justify', padding: '0.5em', backgroundColor: unbondColour, border: '0.1em solid rgba(54, 46, 46, 0.1)' }}>
            <Ticket seed={obj.seed + "-neworchs-"} icon={"📉"} subtext={obj.data.unbondCount + " unbonded"} descriptions={[
              obj.data.unbondCount + " delegators unbonded " + obj.data.unbondStakeSum.toFixed(2) + " LPT"
            ]} />
          </div>
        </div> : null
      }
      <div className="halfVerticalDivider" />
      {obj.data.rewardCount ?
        <div className="row">
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'stretch', maxWidth: '61.8%', textAlign: 'justify', padding: '0.5em', backgroundColor: rewardColour, border: '0.1em solid rgba(54, 46, 46, 0.1)' }}>
            <Ticket seed={obj.seed + "-neworchs-"} icon={"⌛"} subtext={obj.data.rewardCount + " reward calls"} descriptions={[
              obj.data.rewardCount + " reward calls were made worth " + obj.data.rewardAmountSum.toFixed(2) + " LPT"
            ]} />
          </div>
        </div> : null
      }
      <div className="halfVerticalDivider" />
      {obj.data.claimCount ?
        <div className="row">
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'stretch', maxWidth: '61.8%', textAlign: 'justify', padding: '0.5em', backgroundColor: claimColour, border: '0.1em solid rgba(54, 46, 46, 0.1)' }}>
            <Ticket seed={obj.seed + "-neworchs-"} icon={"💸"} subtext={obj.data.claimCount + " reward claims"} descriptions={[
              obj.data.claimRewardSum.toFixed(2) + "  LPT and " + obj.data.claimFeeSum.toFixed(2) + " ETH rewards were claimed"
            ]} />
          </div>
        </div> : null
      }
      <div className="halfVerticalDivider" />
      {obj.data.withdrawStakeCount ?
        <div className="row">
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'stretch', maxWidth: '61.8%', textAlign: 'justify', padding: '0.5em', backgroundColor: withdrawStakeColour, border: '0.1em solid rgba(54, 46, 46, 0.1)' }}>
            <Ticket seed={obj.seed + "-neworchs-"} icon={"🏦"} subtext={obj.data.withdrawStakeCount + " withdraw reward calls"} descriptions={[
              obj.data.withdrawStakeAmountSum.toFixed(2) + " LPT worth of staking rewards were withdrawn"
            ]} />
          </div>
        </div> : null
      }
      <div className="halfVerticalDivider" />
      {obj.data.withdrawFeesCount ?
        <div className="row">
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'stretch', maxWidth: '61.8%', textAlign: 'justify', padding: '0.5em', backgroundColor: withdrawStakeColour, border: '0.1em solid rgba(54, 46, 46, 0.1)' }}>
            <Ticket seed={obj.seed + "-neworchs-"} icon={"🏦"} subtext={obj.data.withdrawFeesCount + " withdraw fee calls"} descriptions={[
              obj.data.withdrawFeesAmountSum.toFixed(2) + " ETH worth of staking rewards were withdrawn"
            ]} />
          </div>
        </div> : null
      }
      <div className="halfVerticalDivider" />
      {obj.data.moveStakeCount ?
        <div className="row">
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'stretch', maxWidth: '61.8%', textAlign: 'justify', padding: '0.5em', backgroundColor: stakeColour, border: '0.1em solid rgba(54, 46, 46, 0.1)' }}>
            <Ticket seed={obj.seed + "-neworchs-"} icon={"🔄"} subtext={obj.data.moveStakeCount + " stake movements"} descriptions={[
              obj.data.moveStakeSum.toFixed(2) + " LPT worth of stake was moved between orchestrators"
            ]} />
          </div>
        </div> : null
      }
      <div className="halfVerticalDivider" />
      {obj.data.winningTicketsReceivedCount ?
        <div className="row">
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'stretch', maxWidth: '61.8%', textAlign: 'justify', padding: '0.5em', backgroundColor: ticketTransferColour, border: '0.1em solid rgba(54, 46, 46, 0.1)' }}>
            <Ticket seed={obj.seed + "-neworchs-"} icon={"🎫"} subtext={obj.data.winningTicketsReceivedCount + " winning tickets"} descriptions={[
              obj.data.winningTicketsReceivedCount + " winning tickets were sent out by " + obj.data.winningTicketsSent.length + " broadcasters"
            ]} />
          </div>
        </div> : null
      }
      <div className="halfVerticalDivider" />
      {obj.data.winningTicketsRedeemedCount ?
        <div className="row">
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'stretch', maxWidth: '61.8%', textAlign: 'justify', padding: '0.5em', backgroundColor: ticketRedeemColour, border: '0.1em solid rgba(54, 46, 46, 0.1)' }}>
            <Ticket seed={obj.seed + "-neworchs-"} icon={"🎟️"} subtext={obj.data.winningTicketsRedeemedCount + " winning tickets"} descriptions={[
              obj.data.winningTicketsRedeemedCount + " winning tickets were redeemed worth " + obj.data.winningTicketsRedeemedSum.toFixed(2) + " ETH"
            ]} />
          </div>
        </div> : null
      }<div className="halfVerticalDivider" />
      <div className="verticalDivider" />
      {stakeObj}
      {earningsObj}
      {broadcasterObj}
      <div className="flexContainer forceWrap">
        {
          sortedList.map(function (orch, i) {
            let thisCommission = null;
            let thisStake = null;
            let thisEarnings = null;

            for (const obj of ticketList) {
              if (obj.address == orch.address) {
                thisEarnings = obj;
              }
            }
            for (const obj of commissionList) {
              if (obj.address == orch.address) {
                thisCommission = obj;
              }
            }
            for (const obj of stakeList) {
              if (obj.address == orch.address) {
                thisStake = obj;
              }
            }
            let thisScore = null;
            if (thisScores && thisScores.scores) {
              thisScore = thisScores.scores[orch.address];
            }
            return (
              <div className='stroke' key={obj.seed + orch.address + i}>
                <Winner
                  thisScore={thisScore}
                  totalEarnings={obj.data.winningTicketsReceivedSum}
                  thisEarnings={thisEarnings}
                  totalStake={totalStakeSum}
                  thisStake={thisStake}
                  thisCommission={thisCommission}
                  address={orch.address}
                  thisIndex={i + 1}
                  seed={obj.seed + "win" + orch.address + i}
                />
                <div className="verticalDivider" />
              </div>
            )
          })
        }
      </div>
      <div className="verticalDivider" />
    </div>
  )
}

export default WinnerMonth;