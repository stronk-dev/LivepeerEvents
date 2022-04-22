import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { VictoryPie } from 'victory';
import { SegmentedControl } from "@mantine/core";

const MonthlyGraphs = (obj) => {
  const livepeer = useSelector((state) => state.livepeerstate);
  const [activeGraph, setGraph] = useState(2);

  let totalGraphs = 0;

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

    totalGraphs++;

    stakeObj = <div className="stroke" style={{ width: 'unset' }}>
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

    totalGraphs++;

    earningsObj = <div className="stroke" style={{ width: 'unset' }}>
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

    console.log("+1 for tickets");
    console.log(obj.data.winningTicketsSent);
    console.log(obj.data.winningTicketsReceivedSum);
    console.log(pieList);

    totalGraphs++;

    broadcasterObj = <div className="stroke" style={{ width: 'unset' }}>
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

  let thisColour;
  if (activeGraph == 1) {
    thisColour = "violet";
  } else if (activeGraph == 2) {
    thisColour = "green";
  } else if (activeGraph == 3) {
    thisColour = "orange";
  }

  let dataRow = [];
  if (totalGraphs && stakeObj) {
    dataRow.push({ label: 'Stake', value: '1' });
  }
  if (totalGraphs && earningsObj) {
    dataRow.push({ label: 'Earnings', value: '2' });
  }
  if (totalGraphs && broadcasterObj) {
    dataRow.push({ label: 'Broadcasters', value: '3' });
  }

  return (
    <div className="stroke fullMargin insetEffect" style={{ padding: 0, margin: 0 }}>
      <div className="row" style={{ margin: 0 }}>
        {totalGraphs > 1 ?
          <SegmentedControl
            styles={{
              root: { backgroundColor: 'rgba(103, 103, 103, 0.6)' },
              label: { color: 'black' },
              labelActive: { color: 'black' },
              input: { color: 'black' },
              control: { color: 'black' },
              controlActive: {},
              active: { color: 'black' },
              disabled: {},
            }}
            value={activeGraph}
            onChange={setGraph}
            radius="md"
            spacing="lg"
            size="lg"
            transitionDuration={200}
            transitionTimingFunction="linear"
            color={thisColour}
            data={dataRow}
          />
          : null}
      </div>
      <div className="row" style={{ marginTop: '1em', marginBottom: '1em', minHeight: '70vh', height: '100%' }}>
        {(activeGraph == 1) ? stakeObj : null}
        {(activeGraph == 2) ? earningsObj : null}
        {(activeGraph == 3) ? broadcasterObj : null}
      </div>
    </div>
  )
}

export default MonthlyGraphs;