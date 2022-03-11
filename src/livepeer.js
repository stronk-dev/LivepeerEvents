import React, { useState, useEffect } from 'react'
import './style.css';
import { Navigate, useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux'
import { getOrchestratorInfo, clearOrchestrator } from "./actions/livepeer";
import EventViewer from "./eventViewer";
import Orchestrator from "./orchestratorViewer";
import Stat from "./statViewer";

// Shows the EventViewer and other Livepeer related info
const defaultMaxShown = 100;

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
    if (prefill.get('orchAddr') && prefill.get('orchAddr') !== "") {
      dispatch(getOrchestratorInfo(prefill.get('orchAddr')));
      setSearchTerm(prefill.get('orchAddr'));
    }
  }, [prefill]);

  if (redirectToHome) {
    return <Navigate push to="/" />;
  }

  let ethPrice = 0;
  if (livepeer.quotes) {
    if (livepeer.quotes.ETH) {
      ethPrice = livepeer.quotes.ETH.price.toFixed(2);
    }
  }

  let l1GasFeeInGwei = 0;
  let l2GasFeeInGwei = 0;
  let redeemRewardCostL1 = 0;
  let redeemRewardCostL2 = 0;
  let claimTicketCostL1 = 0;
  let claimTicketCostL2 = 0;
  let withdrawFeeCostL1 = 0;
  let withdrawFeeCostL2 = 0;
  let stakeFeeCostL1 = 0;
  let stakeFeeCostL2 = 0;
  let commissionFeeCostL1 = 0;
  let commissionFeeCostL2 = 0;
  let serviceUriFeeCostL1 = 0;
  let serviceUriFeeCostL2 = 0;
  if (livepeer.blockchains) {
    l1GasFeeInGwei = livepeer.blockchains.l1GasFeeInGwei;
    l2GasFeeInGwei = livepeer.blockchains.l2GasFeeInGwei;
    redeemRewardCostL1 = livepeer.blockchains.redeemRewardCostL1;
    redeemRewardCostL2 = livepeer.blockchains.redeemRewardCostL2;
    claimTicketCostL1 = livepeer.blockchains.claimTicketCostL1;
    claimTicketCostL2 = livepeer.blockchains.claimTicketCostL2;
    withdrawFeeCostL1 = livepeer.blockchains.withdrawFeeCostL1;
    withdrawFeeCostL2 = livepeer.blockchains.withdrawFeeCostL2;
    stakeFeeCostL1 = livepeer.blockchains.stakeFeeCostL1;
    stakeFeeCostL2 = livepeer.blockchains.stakeFeeCostL2;
    commissionFeeCostL1 = livepeer.blockchains.commissionFeeCostL1;
    commissionFeeCostL2 = livepeer.blockchains.commissionFeeCostL2;
    serviceUriFeeCostL1 = livepeer.blockchains.serviceUriFeeCostL1;
    serviceUriFeeCostL2 = livepeer.blockchains.serviceUriFeeCostL2;
  }

  let redeemRewardCostL1USD = 0;
  let redeemRewardCostL2USD = 0;
  let claimTicketCostL1USD = 0;
  let claimTicketCostL2USD = 0;
  let withdrawFeeCostL1USD = 0;
  let withdrawFeeCostL2USD = 0;
  let stakeFeeCostL1USD = 0;
  let stakeFeeCostL2USD = 0;
  let commissionFeeCostL1USD = 0;
  let commissionFeeCostL2USD = 0;
  let serviceUriFeeCostL1USD = 0;
  let serviceUriFeeCostL2USD = 0;
  if (l1GasFeeInGwei && ethPrice) {
    if (redeemRewardCostL1) {
      redeemRewardCostL1USD = (redeemRewardCostL1 * ethPrice).toFixed(2);
    }
    if (claimTicketCostL1) {
      claimTicketCostL1USD = (claimTicketCostL1 * ethPrice).toFixed(2);
    }
    if (withdrawFeeCostL1) {
      withdrawFeeCostL1USD = (withdrawFeeCostL1 * ethPrice).toFixed(2);
    }
    if (stakeFeeCostL1) {
      stakeFeeCostL1USD = (stakeFeeCostL1 * ethPrice).toFixed(2);
    }
    if (commissionFeeCostL1) {
      commissionFeeCostL1USD = (commissionFeeCostL1 * ethPrice).toFixed(2);
    }
    if (serviceUriFeeCostL1) {
      serviceUriFeeCostL1USD = (serviceUriFeeCostL1 * ethPrice).toFixed(2);
    }
  }
  if (l2GasFeeInGwei && ethPrice) {
    if (redeemRewardCostL2) {
      redeemRewardCostL2USD = (redeemRewardCostL2 * ethPrice).toFixed(2);
    }
    if (claimTicketCostL2) {
      claimTicketCostL2USD = (claimTicketCostL2 * ethPrice).toFixed(2);
    }
    if (withdrawFeeCostL2) {
      withdrawFeeCostL2USD = (withdrawFeeCostL2 * ethPrice).toFixed(2);
    }
    if (stakeFeeCostL2) {
      stakeFeeCostL2USD = (stakeFeeCostL2 * ethPrice).toFixed(2);
    }
    if (commissionFeeCostL2) {
      commissionFeeCostL2USD = (commissionFeeCostL2 * ethPrice).toFixed(2);
    }
    if (serviceUriFeeCostL2) {
      serviceUriFeeCostL2USD = (serviceUriFeeCostL2 * ethPrice).toFixed(2);
    }
  }

  let eventsList = [];
  if (livepeer.events) {
    eventsList = livepeer.events;
  }

  let ticketList = [];
  let ticketBit;
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
      <div className="strokeSmollLeft" style={{ margin: 0, padding: 0, width: '100%', marginTop: '1em' }}>
        <div className="row" style={{ alignItems: 'stretch', height: '100%', padding: '0.2em', width: "unset" }}>
          <Orchestrator thisOrchestrator={thisOrchObj} rootOnly={false} forceVertical={true} />
        </div>
        <div className="stroke metaSidebar" style={{ padding: 0, maxWidth: "300px" }}>
          <div className="row" style={{ margin: 0, padding: 0 }}>
            <h3 style={{ margin: 0, padding: 0 }}>Smart contract prices</h3>
          </div>
          <div className="stroke" style={{ margin: 0, padding: 0 }}>
            <div className='rowAlignRight'>
              <Stat header={"Reward Call"} content1={"$" + redeemRewardCostL2USD + " (vs " + redeemRewardCostL1USD + " on L1)"} />
              <Stat header={"Claim Ticket"} content1={"$" + claimTicketCostL2USD + " (vs " + claimTicketCostL1USD + " on L1)"} />
            </div>
            <div className='rowAlignRight'>
              <Stat header={"Staking Fees"} content1={"$" + stakeFeeCostL2USD + " (vs " + stakeFeeCostL1USD + " on L1)"} />
              <Stat header={"Set Config"} content1={"$" + commissionFeeCostL2USD + " (vs " + commissionFeeCostL1USD + " on L1)"} />
            </div>
          </div>
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
            <h1 style={{ margin: 0, padding: 0 }}>🏠</h1>
          </button>
          <h4 className="rowAlignLeft withWrap elipsOnMobile">{headerString}</h4>
        </div>
        <div className='rowAlignRight'>
          <button className="homeButton" style={{ padding: 0, paddingRight: '1em', paddingLeft: '1em' }} onClick={() => {
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