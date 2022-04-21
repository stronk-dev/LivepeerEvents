import React, { useState, useEffect } from 'react'
import '../style.css';
import { Navigate } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import { Accordion } from '@mantine/core';
import ScrollContainer from 'react-indiana-drag-scroll';
import WinnerMonth from '../components/WinnerMonth';
// import Graphs from '../components/Graphs';

const Stats = (obj) => {
  const livepeer = useSelector((state) => state.livepeerstate);
  const [redirectToHome, setRedirectToHome] = useState(false);
  const [removeOnlyStakers, setRemoveOnlyStakers] = useState(false);

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
        {/* <div className='rowAlignRight'>
          <p>Filter</p>
          <div className="toggle-container" onClick={() => setRemoveOnlyStakers(!removeOnlyStakers)}>
            <div className={`dialog-button ${removeOnlyStakers ? "" : "disabled"}`}>
              {removeOnlyStakers ? "Show" : "Hide"}
            </div>
          </div>
        </div> */}
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
                          {/* <Graphs commissions={livepeer.allCommissions} stakes={livepeer.allTotalStakes} /> */}
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

                              return (
                                <Accordion.Item
                                  label={data.year + "-" + thisMonth + ": " + data.winningTicketsReceived.length + " orchestrators earned " + data.winningTicketsReceivedSum.toFixed(2) + " Eth"}
                                  className="stroke"
                                  key={"accord" + i + data.year + "-" + data.month + "-" + data.total}>
                                  <WinnerMonth
                                    data={data}
                                    removeOnlyStakers={removeOnlyStakers}
                                    seed={"win" + i + data.year + "-" + data.month + "-" + data.total}
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

export default Stats;