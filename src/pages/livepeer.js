import React, { useState, useEffect } from 'react'
import '../style.css';
import { Navigate, useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import { getOrchestratorInfo, clearOrchestrator } from "../actions/livepeer";
import EventViewer from "../components/eventViewer";
import Orchestrator from "../components/orchestratorViewer";
import ContractPrices from '../components/ContractPrices';

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
  const [showSidebar, setShowSidebar] = useState(true);
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

  let eventsList = [];
  if (livepeer.events) {
    eventsList = livepeer.events;
  }

  let ticketList = [];
  if (livepeer.tickets) {
    ticketList = livepeer.tickets;
  }

  let thisOrchObj;
  let headerString;
  if (livepeer.selectedOrchestrator) {
    thisOrchObj = livepeer.selectedOrchestrator;
    headerString = "Inspecting " + thisOrchObj.id;
  } else {
    headerString = "Livepeer Orchestrator Explorer";
  }

  let sidebar;
  if (showSidebar) {
    sidebar = <div id='sideContent'>
      <div className="verticalDivider" />
      <div className="strokeSmollLeft sideMargin">
        <div className="row">
          <div className="row">
            <Orchestrator thisOrchestrator={thisOrchObj} rootOnly={false} forceVertical={true} />
          </div>
        </div>
        <div className="verticalDivider" />
        <div className="row">
          <ContractPrices quotes={livepeer.quotes} blockchains={livepeer.blockchains} />
        </div>
      </div>
    </div >
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
          <p>Sidebar</p>
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
        {sidebar}
        <div className="mainContent">
          <EventViewer events={eventsList} searchTerm={searchTerm} setSearchTerm={setSearchTerm}
            forceVertical={true} showFilter={showFilter} setAmountFilter={setAmountFilter} amountFilter={amountFilter}
            maxAmount={maxAmount} setMaxAmount={setMaxAmount} tickets={ticketList} />
        </div>
      </div>
    </div >
  );
}

export default Livepeer;