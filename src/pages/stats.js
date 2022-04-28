import React, { useState } from 'react'
import '../style.css';
import { Navigate } from "react-router-dom";
import { useSelector } from 'react-redux';
import { Accordion } from '@mantine/core';
import MonthlyStats from './MonthlyStats';

const Stats = (obj) => {
  const livepeer = useSelector((state) => state.livepeerstate);
  const [redirectToHome, setRedirectToHome] = useState(false);
  const [showOnlyTranscoders, setShowOnlyTranscoders] = useState(true);

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

                          const title = data.year + "-" + thisMonth + ": " + data.winningTicketsReceived.length + " orchestrators earned " + data.winningTicketsReceivedSum.toFixed(2) + " Eth";

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