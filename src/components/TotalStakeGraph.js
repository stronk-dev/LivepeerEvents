import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { VictoryLine, VictoryChart, VictoryLegend } from 'victory';

const TotalStakeGraph = (obj) => {
  const livepeer = useSelector((state) => state.livepeerstate);

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

  const colors = [
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
  ]
  let listOfNames = [];
  let listOfLists = [];
  let listToParse = [...obj.data];

  // Turn unprocessed list into a per orchestrator list
  while (listToParse.length) {
    // Take first orchestrator as the current orchestrator
    const currentOrchestrator = listToParse[0].address;
    let thisIdx = listToParse.length - 1;
    let curData = [];
    // Split of all orchestrators 
    while (thisIdx >= 0) {
      const cur = listToParse[thisIdx];
      if (cur.address == currentOrchestrator) {
        const thisDate = new Date(cur.timestamp);
        curData.push({
          x: thisDate,
          y: cur.totalStake.toFixed(0)
        });
        listToParse.splice(thisIdx, 1);
      }
      thisIdx--;
    }
    if (curData.length) {
      listOfNames.push(currentOrchestrator);
      listOfLists.push(curData);
    }
  }

  let legendData = [];

  return (
    <div className="stroke fullMargin insetEffect" style={{ padding: 0, margin: 0 }}>
      <div className="row" style={{ marginTop: '1em', marginBottom: '1em', minHeight: '70vh', height: '100%' }}>
        <div className="stroke" style={{ width: 'unset' }}>
          <h4>Total stake over time</h4>
          <VictoryChart
            width={1920}
            height={1080}
            padding={100}
            fixLabelOverlap={true}
          >
            {listOfLists.map((thisData, thisIndex) => {
              if (thisIndex < 100) {
                legendData.push({ name: getName(listOfNames[thisIndex]), symbol: { fill: colors[thisIndex % colors.length] } });
                return (
                  <VictoryLine
                    key={"orch" + thisIndex}
                    padding={0}
                    data={thisData}
                    standalone={false}
                    style={{
                      backgroundColor: 'rgba(122, 128, 127, 0.4)',
                      data: {
                        fillOpacity: 0.9, stroke: colors[thisIndex % colors.length], strokeWidth: 1.5
                      },
                      labels: {
                        fontSize: 24, zIndex: 999
                      }
                    }}
                  />
                )
              } else {
                return null;
              }
            })}
          </VictoryChart>
          <div className='row'>
            <VictoryLegend
              title="Legend"
              centerTitle
              orientation="horizontal"
              gutter={20}
              width={1920}
              fixLabelOverlap={true}
              height={1080}
              padding={100}
              style={{ border: { stroke: "black" }, title: { fontSize: 20 } }}
              data={legendData}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default TotalStakeGraph;