import React, { useState } from 'react'
import '../style.css';
import { Navigate } from "react-router-dom";
import { useSelector } from 'react-redux';
import { Accordion } from '@mantine/core';
import MonthlyStats from './MonthlyStats';

function updateClipboard(newClip) {
  navigator.clipboard.writeText(newClip).then(
    () => {
      console.log("Copied!");
    },
    () => {
      console.log("Copy failed!");
    }
  );
}

function copyLink(addr) {
  navigator.permissions
    .query({ name: "clipboard-write" })
    .then((result) => {
      if (result.state === "granted" || result.state === "prompt") {
        updateClipboard(addr);
      }
    });
}

const Stats = (obj) => {
  const livepeer = useSelector((state) => state.livepeerstate);
  const [redirectToHome, setRedirectToHome] = useState(false);
  const [showOnlyTranscoders, setShowOnlyTranscoders] = useState(true);

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
            return thisAddr.domain;
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
              return thisAddr.name;
            }
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


  function getDataFor(year, month, data) {
    let summary = month + " " + year + ": \r\n";

    let totalStakeSum = 0;
    if (data.latestTotalStake && data.latestTotalStake.length) {
      let ticketIdx = data.latestTotalStake.length - 1;
      // Calc total stake at that time
      while (ticketIdx >= 0) {
        const thisTicket = data.latestTotalStake[ticketIdx];
        ticketIdx -= 1;
        totalStakeSum += thisTicket.totalStake;
      }
    }

    if (data.reactivationCount) {
      summary += "🔌 " + data.reactivationCount + " orchestrators reactivated \r\n";
    }
    if (data.activationCount) {
      summary += "🔧 " + data.activationCount + " orchestrators joined with an initial stake of " + data.activationInitialSum.toLocaleString({ maximumFractionDigits: 2 }) + " LPT \r\n";
    }
    // if (data.latestCommission && data.latestCommission.length) {
    //   summary += "🔗 " + data.latestCommission.length + " orchestrators had a total of " + totalStakeSum.toLocaleString({ maximumFractionDigits: 2 }) + " LPT staked to them \r\n";
    // }
    if (data.bondCount) {
      summary += "📈 " + data.bondCount + " accounts delegated for the first time for a total of " + data.bondStakeSum.toLocaleString({ maximumFractionDigits: 2 }) + " LPT \r\n";
    }
    if (data.unbondCount) {
      summary += "📉 " + data.unbondCount + " delegators unbonded " + data.unbondStakeSum.toLocaleString({ maximumFractionDigits: 2 }) + " LPT \r\n";
    }
    if (data.rewardCount) {
      summary += "⌛ " + data.rewardCount + " reward calls made were made by orchestrators worth " + data.rewardAmountSum.toLocaleString({ maximumFractionDigits: 2 }) + " LPT \r\n";
    }
    if (data.claimCount) {
      summary += "🏦 " + data.claimRewardSum.toLocaleString({ maximumFractionDigits: 2 }) + " LPT and " + data.claimFeeSum.toLocaleString({ maximumFractionDigits: 2 }) + " ETH worth of rewards were claimed by delegators \r\n";
    }
    if (data.withdrawStakeCount) {
      summary += "💸 " + data.withdrawStakeAmountSum.toLocaleString({ maximumFractionDigits: 2 }) + " LPT worth of staking rewards were withdrawn to the accounts of delegators \r\n";
    }
    if (data.withdrawFeesCount) {
      summary += "💸 " + data.withdrawFeesAmountSum.toLocaleString({ maximumFractionDigits: 2 }) + " ETH worth of transcoding fees were withdrawn to the accounts of delegators \r\n";
    }
    if (data.moveStakeCount) {
      summary += "🔄 " + data.moveStakeSum.toLocaleString({ maximumFractionDigits: 2 }) + " LPT worth of stake was moved directly between orchestrators in " + data.moveStakeCount + " transactions \r\n";
    }
    if (data.winningTicketsReceivedCount) {
      summary += "🎫 " + data.winningTicketsReceivedCount + " winning tickets were sent out by " + data.winningTicketsSent.length + " broadcasters \r\n";
    }
    if (data.winningTicketsRedeemedCount) {
      summary += "🎟️ " + data.winningTicketsRedeemedCount + " winning tickets were redeemed worth " + data.winningTicketsRedeemedSum.toLocaleString({ maximumFractionDigits: 2 }) + " ETH \r\n";
    }
    summary += "\r\n";

    let winnerList = [...data.winningTicketsReceived] || [];
    let stakeList = data.latestTotalStake || [];

    // Count earners of more than 0.2 Eth
    let luckyCount = 0;
    let totalStakeSumEarners = 0;
    for (const thisObj of winnerList) {
      if (thisObj.sum > 0.2) {
        luckyCount++;
      }
      for (const thisObjB of stakeList) {
        if (thisObjB.address == thisObj.address) {
          totalStakeSumEarners += thisObjB.totalStake;
        }
      }
    }

    if (data.winningTicketsReceived.length && data.winningTicketsReceivedSum) {
      summary += data.winningTicketsReceived.length + " orchestrators earned " + data.winningTicketsReceivedSum.toFixed(2) + " Eth \r\n";
    }
    summary += luckyCount + " orchestrators earned more than 0.2 Eth \r\n";
    summary += "Top 10 earners for this month are: \r\n";

    // Find highest earner
    const maxPrint = 10;
    let currentPrinted = 0;
    while (currentPrinted < maxPrint && winnerList.length) {
      let ticketIdx2 = winnerList.length - 1;
      let largestIdx = 0;
      let largestValue = 0;
      while (ticketIdx2 >= 0) {
        const currentOrch = winnerList[ticketIdx2];
        let thisVal;
        for (const obj of winnerList) {
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

      currentPrinted++;
      const largestObj = winnerList[largestIdx];
      // Print highest earner info
      const earningsPercentage = parseFloat((largestObj.sum / data.winningTicketsReceivedSum) * 100);
      summary += "#" + currentPrinted + ": " + getName(largestObj.address) + " won " + largestObj.count + " tickets worth " + largestObj.sum.toFixed(2) + " Eth" + " (" + earningsPercentage.toFixed(2) + "%)";

      // Add stake info if available
      for (const thisObj of stakeList) {
        if (thisObj.address == largestObj.address) {
          const stakePercentage = parseFloat((thisObj.totalStake / totalStakeSumEarners) * 100);
          summary += " with a stake of " + thisObj.totalStake.toFixed(0) + " LPT (" + stakePercentage.toFixed(2) + "%)";
        }
      }

      summary += "\r\n";
      // Remove from list
      winnerList.splice(largestIdx, 1);
    }

    if (stakeList.length) {
      summary += "\r\nThe percentages are their share of the total fees for that month and their latest known stake compared to the stake of all orchestrators who won a ticket in that month\r\n";
    }

    copyLink(summary);
  }

  console.log("Rendering Stats Viewer");

  if (redirectToHome) {
    return <Navigate push to="/" />;
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
          <h4 className="rowAlignLeft withWrap showNeverOnMobile">Statistics</h4>
        </div>
        <div className='rowAlignRight'>
          <p>Hide non-earners</p>
          <div className="toggle-container" onClick={() => setShowOnlyTranscoders(!showOnlyTranscoders)}>
            <div className={`dialog-button ${showOnlyTranscoders ? "" : "disabled"}`}>
              {showOnlyTranscoders ? "Show" : "Hide"}
            </div>
          </div>
        </div>
      </div>
      <div id='bodyContent'>
        <div className="row">
          <div className="stroke roundedOpaque onlyVerticalScroll" style={{ minWidth: '350px', width: '50vw', maxWidth: '1200px', height: 'calc( 100vh - 50px - 2em)', marginTop: '2em' }}>
            <div className="content-wrapper" style={{ width: '100%' }}>
              <div className="overflow-container">
                <div className="overflow-content" style={{ padding: 0 }}>
                  <div className="flexContainer forceWrap" >
                    <Accordion initialItem={0} className="stroke"
                      style={{
                        width: '100%', alignItems: 'stretch'
                      }}
                      styles={{
                        item: {
                          padding: 0, width: '100%', alignItems: 'stretch',
                          color: 'black',
                          border: '1px solid rgba(56, 56, 56, 0.9)',
                          '&:hover': {
                            color: 'black',
                            border: '1px solid rgba(56, 56, 56, 0.9)',
                          },
                          '&': {
                            color: 'black',
                            border: '1px solid rgba(56, 56, 56, 0.9)',
                          }
                        },
                        itemOpened: { padding: 0, width: '100%', alignItems: 'stretch' },
                        itemTitle: {
                          color: 'rgba(218, 218, 218, 0.9)',
                          padding: 0, width: '100%',
                        },
                        control: {
                          color: 'rgba(218, 218, 218, 0.9)',
                          padding: 0, margin: 0, height: '100%',
                          backgroundColor: 'rgba(56, 56, 56, 0.8)',
                          boxShadow: 'inset 3px 3px 12px 2px rgba(62, 62, 104, 0.05)',
                          color: 'black',
                          border: 'none',
                          '&:hover': {
                            color: 'black',
                            backgroundColor: 'rgba(56, 56, 56, 0.9)',
                          },
                          '&': {
                            color: 'black',
                            backgroundColor: 'rgba(56, 56, 56, 0.8)',
                            border: 'none',
                          }
                        },
                        label: {
                          color: 'rgba(218, 218, 218, 0.9)',
                          padding: '1em', width: '100%',
                          backgroundColor: 'rgba(56, 56, 56, 0.8)',
                          boxShadow: 'inset 3px 3px 12px 2px rgba(62, 62, 104, 0.05)'
                        },
                        icon: {
                          padding: '0.2em', margin: '0.2em',
                        },
                        content: {
                          padding: 0, alignItems: 'stretch', width: '100%', height: '100%',
                          backgroundColor: 'rgba(56, 56, 56, 0.3)',
                          boxShadow: 'inset 3px 3px 12px 2px rgba(62, 62, 104, 0.05)'
                        },
                        contentInner: { padding: 0, width: '100%', height: '100%' },
                      }}>
                      {
                        livepeer.monthlyStats.slice(0).reverse().map(function (data, i) {
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

                          const title = (
                            <div className='row'>
                              <div className='rowAlignLeft'>
                                <h3 className="lightTextAlt">{data.year}-{thisMonth}: {data.winningTicketsReceived.length} orchestrators earned {data.winningTicketsReceivedSum.toFixed(2)} Eth</h3>
                              </div>
                              <div className='rowAlignRight'>
                                <div className="selectOrchLight" onClick={() => {
                                  getDataFor(data.year, thisMonth, data);
                                }}>
                                  <img alt="" src="clipboard.svg" width="20em" height="20em" />
                                </div>
                              </div>
                            </div>
                          )

                          return (
                            <Accordion.Item
                              label={title}
                              icon={"🔄"}
                              className="stroke"
                              style={{ width: '100%', alignItems: 'stretch' }}
                              key={"accord" + i + data.year + "-" + data.month + "-" + data.total}>
                              <MonthlyStats
                                data={data}
                                showOnlyTranscoders={showOnlyTranscoders}
                                seed={"win" + i + data.year + "-" + data.month + "-" + data.total}
                              />
                            </Accordion.Item>
                          )
                        })
                      }
                    </Accordion>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div >
    </div >
  );
}

export default Stats;