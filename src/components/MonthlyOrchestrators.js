import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import ScrollContainer from "react-indiana-drag-scroll";
import Winner from '../components/WinnerStat';
import {
  getOrchestratorScores
} from "../actions/livepeer";
import { Pagination } from "@mantine/core";

const itemsPerPage = 10;

const MonthlyOrchestrators = (obj) => {
  const livepeer = useSelector((state) => state.livepeerstate);
  const [thisScores, setThisScores] = useState(null);
  const [activePage, setPage] = useState(1);

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

  // Show all orchs (if latestTotalStake exists) or show only those in winningTicketsReceived
  let ticketList = obj.data.winningTicketsReceived || [];
  let commissionList = obj.data.latestCommission || [];
  let stakeList = obj.data.latestTotalStake || [];


  // Show all orchs (if latestTotalStake exists) or show only those in winningTicketsReceived
  let orchList;
  let totalStakeSum = 0;
  if (obj.data.latestTotalStake && obj.data.latestTotalStake.length) {
    orchList = [...obj.data.latestTotalStake];
    // Filter out orchestrators who have not earned any fees, to get a more accurate earnings vs stake overview
    if (obj.showOnlyTranscoders) {
      if (obj.data.winningTicketsReceived && obj.data.winningTicketsReceived.length) {
        // For each orchestrator in latestTotalStake, splice it if they are not present in winningTicketsReceived
        let ticketIdx = obj.data.latestTotalStake.length - 1;
        while (ticketIdx >= 0) {
          const thisOrch = obj.data.latestTotalStake[ticketIdx];
          let found = false;
          for (const orchWinnings of obj.data.winningTicketsReceived) {
            if (orchWinnings.address == thisOrch.address) {
              found = true;
              break;
            }
          }
          if (!found) {
            orchList.splice(ticketIdx, 1);
          } else {
            totalStakeSum += thisOrch.totalStake;
          }
          ticketIdx--;
        }
      }
    } else {
      for (const thisOrch of obj.data.latestTotalStake) {
        totalStakeSum += thisOrch.totalStake;
      }
    }
  } else {
    orchList = [...obj.data.winningTicketsReceived];
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

  const totalPages = (sortedList.length + (itemsPerPage - (sortedList.length % itemsPerPage))) / itemsPerPage;

  return (
    <div className="stroke fullMargin insetEffect" style={{ padding: 0, margin: 0, height: '70vh' }}>
      <div className="row" style={{ marginTop: '1em', marginBottom: '1em' }}>
        {totalPages > 1 ?
          <Pagination page={activePage} onChange={setPage} total={totalPages} siblings={1} initialPage={1} />
          : null}
      </div>
      <div className="content-wrapper">
        <ScrollContainer className="overflow-container" hideScrollbars={false} style={{}}>
          <div className="overflow-content" style={{ cursor: 'grab', maxHeight: '300px' }}>
            {
              sortedList.map(function (orch, i) {
                const tmp = i - ((activePage - 1) * itemsPerPage);
                if (tmp >= 0 && tmp < itemsPerPage) {
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
                }
                return null;
              })
            }
          </div>
        </ScrollContainer>
      </div>
    </div>
  )
}

export default MonthlyOrchestrators;