import React, { useState, useEffect } from 'react'
import '../style.css';
import { Navigate } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import { Accordion } from '@mantine/core';
import ScrollContainer from 'react-indiana-drag-scroll';
import WinnerMonth from '../components/WinnerMonth';
import { VictoryPie } from 'victory';

const Tickets = (obj) => {
  const livepeer = useSelector((state) => state.livepeerstate);
  const [ticketsPerMonth, setTicketsPerMonth] = useState([]);
  const [redirectToHome, setRedirectToHome] = useState(false);
  const [removeOnlyStakers, setRemoveOnlyStakers] = useState(false);

  console.log("Rendering Winning Ticket Viewer");

  useEffect(() => {
    // Process Winning tickets as: 
    // List of Months containing
    // List of Orchestrators (sorted by earnings) containing
    // List of winning tickets
    let ticketsPerMonth = [];
    let ticketIdx = livepeer.winningTickets.length - 1;
    let currentMonth = 99;
    let currentYear = 99;
    let currentOrchCounter = [];
    while (ticketIdx >= 0) {
      const thisTicket = livepeer.winningTickets[ticketIdx];
      const thisTime = new Date(thisTicket.transactionTime * 1000);
      const thisYear = thisTime.getFullYear();
      const thisMonth = thisTime.getMonth();
      ticketIdx -= 1;

      // On a new month
      if (thisMonth != currentMonth) {
        // Push this months data
        if (currentOrchCounter.length) {
          // Sort this months data
          let sortedList = []
          let currentSum = 0;
          while (currentOrchCounter.length) {
            let ticketIdx2 = currentOrchCounter.length - 1;
            let largestIdx = 0;
            let largestValue = 0;
            // Find current O with most ticket wins in Eth
            while (ticketIdx2 >= 0) {
              const currentOrch = currentOrchCounter[ticketIdx2];
              if (currentOrch.sum > largestValue) {
                largestIdx = ticketIdx2;
                largestValue = currentOrch.sum;
              }
              ticketIdx2 -= 1;
            }
            currentSum += largestValue;
            // Push current biggest list
            sortedList.push(currentOrchCounter[largestIdx]);
            // Remove from list
            currentOrchCounter.splice(largestIdx, 1);
          }
          ticketsPerMonth.push(
            {
              year: currentYear,
              month: currentMonth,
              orchestrators: sortedList,
              total: currentSum
            }
          );
        }
        // clear data
        currentMonth = thisMonth;
        currentYear = thisYear;
        currentOrchCounter = [];
      }
      // Find orch in list
      let thisIdx = 0;
      let thisFound = false;
      let ticketIdx2 = currentOrchCounter.length - 1;
      while (ticketIdx2 >= 0) {
        const currentOrch = currentOrchCounter[ticketIdx2];
        if (currentOrch.address == thisTicket.eventTo) {
          thisFound = true;
          thisIdx = ticketIdx2;
          break;
        }
        ticketIdx2 -= 1;
      }
      // If not in list, append at the end
      if (!thisFound) {
        currentOrchCounter.push({
          address: thisTicket.eventTo,
          sum: thisTicket.eventValue
        });
      } else {
        // Else update that entry
        currentOrchCounter[thisIdx].sum += thisTicket.eventValue;
      }
    }


    if (currentOrchCounter.length) {
      // Sort this months data
      let sortedList = []
      let currentSum = 0;
      while (currentOrchCounter.length) {
        let ticketIdx2 = currentOrchCounter.length - 1;
        let largestIdx = 0;
        let largestValue = 0;
        // Find current O with most ticket wins in Eth
        while (ticketIdx2 >= 0) {
          const currentOrch = currentOrchCounter[ticketIdx2];
          if (currentOrch.sum > largestValue) {
            largestIdx = ticketIdx2;
            largestValue = currentOrch.sum;
          }
          ticketIdx2 -= 1;
        }
        currentSum += largestValue;
        // Push current biggest list
        sortedList.push(currentOrchCounter[largestIdx]);
        // Remove from list
        currentOrchCounter.splice(largestIdx, 1);
      }
      ticketsPerMonth.push(
        {
          year: currentYear,
          month: currentMonth,
          orchestrators: sortedList,
          total: currentSum
        }
      );
    }



    setTicketsPerMonth(ticketsPerMonth);
  }, [livepeer.winningTickets]);

  if (redirectToHome) {
    return <Navigate push to="/" />;
  }

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
      orchIdx -= 1;
      if (removeOnlyStakers && !parseInt(thisOrch.totalVolumeUSD)) {
        continue;
      }
      if ((thisOrch.totalStake / totalStake) < 0.04) {
        otherSum += thisOrch.totalStake;
      } else {
        pieList.push({
          address: getName(thisOrch.id),
          sum: thisOrch.totalStake
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
        <p>Show non-transcoding Orchestrators?</p>
        <div className="toggle-container" onClick={() => setRemoveOnlyStakers(!removeOnlyStakers)}>
          <div className={`dialog-button ${removeOnlyStakers ? "" : "disabled"}`}>
            {removeOnlyStakers ? "Show" : "Hide"}
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
    <div style={{ margin: 0, padding: 0, height: '100%', width: '100%', overflow: 'hidden' }}>
      <div id='header'>
        <div className='rowAlignLeft'>
          <button className="homeButton" onClick={() => {
            setRedirectToHome(true);
          }}>
            <h1>🏠</h1>
          </button>
          <h4 className="rowAlignLeft withWrap showNeverOnMobile">Winning Tickets</h4>
        </div>
      </div>
      <div id='bodyContent'>
        <div className="mainContent">
          <div className="strokeSmollLeft" style={{ height: 'calc( 100vh - 50px)' }}>
            <div className="row" style={{ width: '100%', height: '100%' }}>
              <div className="stroke roundedOpaque onlyVerticalScroll" style={{ width: '40vw', minWidth: '400px', height: 'calc( 100vh - 50px - 2em)', marginTop: '2em' }}>
                <div className="content-wrapper" style={{ width: '100%' }}>
                  <ScrollContainer activationDistance={1} className="overflow-container" hideScrollbars={false}>
                    <div className="overflow-content" style={{ cursor: 'grab', paddingTop: 0 }}>
                      <div className="flexContainer forceWrap" >
                        {pieObj}
                        <Accordion initialItem={0} className="stroke"
                          styles={{
                            item: { padding: 0 },
                            itemOpened: { padding: 0 },
                            itemTitle: { padding: 0, paddingTop: '1em', paddingBottom: '1em' },
                            control: { padding: 0 },
                            label: { padding: 0 },
                            icon: { padding: 0 },
                            content: { padding: 0, paddingTop: '1em', paddingBottom: '1em' },
                            contentInner: { padding: 0 },
                          }}>
                          {
                            ticketsPerMonth.map(function (data) {
                              let thisMonth = "";
                              let monthAsNum = data.month;
                              if (monthAsNum == 0) {
                                thisMonth = "Januari";;
                              } else if (monthAsNum == 1) {
                                thisMonth = "Februari";;
                              } else if (monthAsNum == 2) {
                                thisMonth = "March";;
                              } else if (monthAsNum == 3) {
                                thisMonth = "April";
                              } else if (monthAsNum == 4) {
                                thisMonth = "May";
                              } else if (monthAsNum == 5) {
                                thisMonth = "June";
                              } else if (monthAsNum == 6) {
                                thisMonth = "July";
                              } else if (monthAsNum == 7) {
                                thisMonth = "August";
                              } else if (monthAsNum == 8) {
                                thisMonth = "September";
                              } else if (monthAsNum == 9) {
                                thisMonth = "October";
                              } else if (monthAsNum == 10) {
                                thisMonth = "November";
                              } else if (monthAsNum == 11) {
                                thisMonth = "December";;
                              }

                              return (
                                <Accordion.Item
                                  label={data.year + "-" + thisMonth + ": " + data.orchestrators.length + " orchestrators earned " + data.total.toFixed(2) + " Eth"}
                                  className="stroke"
                                  key={data.year + "-" + data.month + "-" + data.total}>
                                  <WinnerMonth
                                    year={data.year}
                                    month={data.month}
                                    orchestrators={data.orchestrators}
                                    total={data.total}
                                  />
                                </Accordion.Item>
                              )
                            })
                          }
                        </Accordion>
                      </div>
                    </div>
                  </ScrollContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div >
  );
}

export default Tickets;