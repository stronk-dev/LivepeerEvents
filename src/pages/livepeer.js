import React, { useState, useEffect } from 'react'
import '../style.css';
import { Navigate, useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import { getOrchestratorInfo, clearOrchestrator } from "../actions/livepeer";
import EventViewer from "../components/eventViewer";
import Orchestrator from "../components/orchestratorViewer";
import { Dialog, ScrollArea, Stack } from '@mantine/core';
import ScrollContainer from 'react-indiana-drag-scroll';

// Shows the EventViewer and other Livepeer related info
const defaultMaxShown = 50;

const Livepeer = (obj) => {
  const [amountFilter, setAmountFilter] = useState("0");
  const [maxAmount, setMaxAmount] = useState(defaultMaxShown);
  const [prefill, setPrefill] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const dispatch = useDispatch();
  const livepeer = useSelector((state) => state.livepeerstate);
  const [redirectToHome, setRedirectToHome] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [opened, setOpened] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [thisChad, setChad] = useState("");
  console.log("Rendering Livepeer");

  useEffect(() => {
    const searchOrch = prefill.get('orchAddr');
    if (searchOrch && searchOrch !== "") {
      dispatch(getOrchestratorInfo(searchOrch));
      setSearchTerm(searchOrch);
    }
  }, [prefill]);

  if (redirectToHome) {
    return <Navigate push to="/" />;
  }
  

  let thisOrchObj;
  let headerString;
  if (livepeer.selectedOrchestrator) {
    thisOrchObj = livepeer.selectedOrchestrator;
    headerString = "Inspecting " + thisOrchObj.id;
  } else {
    headerString = "Livepeer Orchestrator Explorer";
  }

  if (thisChad == ""){
    const randomChad = performance.now();
    const chadSource = "https://stronk.rocks/avatar.png?" + randomChad;
    setChad(chadSource);
  }

  return (
    <div style={{ margin: 0, padding: 0, height: '100%', width: '100%', overflow: 'hidden' }}>
      <div id='header'>
        <div className='rowAlignLeft'>
          <button className="homeButton" onClick={() => {
            setRedirectToHome(true);
          }}>
            <div className="row">
              <img alt="" src="apple-touch-icon.png" width="40em" height="40em" />
            </div>
          </button>
          <h4 className="rowAlignLeft withWrap showNeverOnMobile">{headerString}</h4>
        </div>
        <div className='rowAlignRight'>
          <button className="homeButton" onClick={() => {
            dispatch(clearOrchestrator());
            setSearchTerm("");
            setAmountFilter(0);
            setMaxAmount(defaultMaxShown);
          }}>
            <h4>✖️ Clear</h4>
          </button>
          <p>Detail</p>
          <div className="toggle-container" onClick={() => setShowSidebar(!showSidebar)}>
            <div className={`dialog-button ${showSidebar ? "" : "disabled"}`}>
              {showSidebar ? "Show" : "Hide"}
            </div>
          </div>
          <p>Filter</p>
          <div className="toggle-container" onClick={() => setShowFilter(!showFilter)}>
            <div className={`dialog-button ${showFilter ? "" : "disabled"}`}>
              {showFilter ? "Show" : "Hide"}
            </div>
          </div>
        </div>
      </div>
      <div id='bodyContent'>
        <Dialog
          opened={showSidebar}
          withCloseButton
          onClose={() => setShowSidebar(false)}
          size="xl"
          shadow="xl"
          radius="md"
          styles={{
            root: { backgroundColor: 'rgba(214, 214, 214, 0.80)', maxHeight: '90vh' },
            closeButton: {},
          }}
        >
          <div className="content-wrapper" style={{ width: '100%' }}>
            <ScrollContainer activationDistance={1} className="overflow-container" hideScrollbars={false} style={{ width: '100%', overflowX: 'hidden' }}>
              <div className="overflow-content" style={{ cursor: 'grab', padding: 0, width: '100%' }}>
                <div className="verticalDivider" />
                <Orchestrator thisOrchestrator={thisOrchObj} rootOnly={false} forceVertical={true} />
                <div className="verticalDivider" />
              </div>
            </ScrollContainer>
          </div>
        </Dialog>
        <div className="mainContent">
          <EventViewer searchTerm={searchTerm} setSearchTerm={setSearchTerm}
            forceVertical={true} setShowFilter={setShowFilter} showFilter={showFilter} setAmountFilter={setAmountFilter} amountFilter={amountFilter}
            maxAmount={maxAmount} setMaxAmount={setMaxAmount}
            updateEvents={livepeer.updateEvents}
            rewardEvents={livepeer.rewardEvents}
            claimEvents={livepeer.claimEvents}
            withdrawStakeEvents={livepeer.withdrawStakeEvents}
            withdrawFeesEvents={livepeer.withdrawFeesEvents}
            transferTicketEvents={livepeer.transferTicketEvents}
            redeemTicketEvents={livepeer.redeemTicketEvents}
            activateEvents={livepeer.activateEvents}
            unbondEvents={livepeer.unbondEvents}
            stakeEvents={livepeer.stakeEvents}
            monthlyStats={livepeer.monthlyStats}
            rounds={livepeer.rounds}
          />
        </div>
      </div>
    </div >
  );
}

export default Livepeer;