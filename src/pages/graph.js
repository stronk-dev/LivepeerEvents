import React, { useState } from 'react'
import '../style.css';
import { Navigate } from "react-router-dom";
import { useSelector } from 'react-redux';
import { SegmentedControl } from "@mantine/core";
import CommissionGraph from '../components/CommissionGraph';
import TotalStakeGraph from '../components/TotalStakeGraph';


const Graphs = (obj) => {
  const livepeer = useSelector((state) => state.livepeerstate);
  const [redirectToHome, setRedirectToHome] = useState(false);
  const [showOnlyTranscoders, setShowOnlyTranscoders] = useState(true);
  const [activePage, setPage] = useState(1);

  let thisColour;
  if (activePage == 1) {
    thisColour = "teal";
  } else if (activePage == 2) {
    thisColour = "indigo";
  } else if (activePage == 3) {
    thisColour = "gray";
  }
  console.log("Rendering Graphs Viewer");

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
          <div className="stroke roundedOpaque onlyVerticalScroll" style={{ width: '100vw', height: 'calc( 100vh - 50px - 2em)', marginTop: '2em' }}>
            <div className="content-wrapper" style={{ width: '100%' }}>
              <div className="overflow-container">
                <div className="overflow-content" style={{ padding: 0 }}>
                  <div className="stroke" key={obj.seed + "menu"} style={{ marginTop: '0', paddingTop: '0' }}>
                    <div className="row" style={{ margin: '0' }}>
                      <SegmentedControl
                        styles={{
                          root: { backgroundColor: 'rgba(103, 103, 103, 0.6)', border: 'none', borderColor: 'transparent' },
                          label: {
                            color: 'black',
                            border: 'none',
                            '&:hover': {
                              color: 'black',
                              backgroundColor: 'rgba(56, 56, 56, 0.2)',
                              border: 'none'
                            },
                            '&': {
                              color: 'black',
                              border: 'none'
                            }
                          },
                          labelActive: {
                            color: 'black',
                            border: 'none',
                            '&:hover': {
                              color: 'black',
                              backgroundColor: 'rgba(56, 56, 56, 0.2)',
                              border: 'none'
                            },
                            '&': {
                              color: 'black',
                              border: 'none'
                            }
                          },
                          input: {

                          },
                          control: {
                            color: 'black',
                            border: 'none',
                            '&:hover': {
                              color: 'black',
                              border: 'none'
                            },
                            '&': {
                              color: 'black',
                              border: 'none'
                            },
                            '&:not(:first-of-type)': {
                              color: 'black',
                              border: 'none'
                            }

                          },
                          controlActive: {
                            color: 'black',
                            border: 'none',
                            '&:hover': {
                              color: 'black',
                              border: 'none'
                            },
                            '&': {
                              color: 'black',
                              border: 'none'
                            }
                          },
                          active: {

                          },
                          disabled: {

                          },
                        }}
                        value={activePage}
                        onChange={setPage}
                        spacing="lg"
                        size="lg"
                        radius={0}
                        transitionDuration={200}
                        transitionTimingFunction="linear"
                        color={thisColour}
                        data={[
                          { label: 'Commission', value: '1' },
                          { label: 'Stake', value: '2' }
                        ]}
                      />
                    </div>
                    {
                      activePage == 1 ? <CommissionGraph
                        data={livepeer.allCommissions}
                        seed={"commission"}
                      /> : null
                    }
                    {
                      activePage == 2 ? <TotalStakeGraph
                        data={livepeer.allTotalStakes}
                        seed={"totalstake"}
                      /> : null
                    }
                    <div className="verticalDivider" />
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

export default Graphs;