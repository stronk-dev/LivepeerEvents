import React, { useEffect, useState } from 'react'
import { useDispatch, batch } from 'react-redux'
import {
  getVisitorStats
} from "../actions/user";
import {
  getQuotes, getBlockchainData, getCurrentOrchestratorInfo,
  getAllEnsDomains, getAllEnsInfo, getAllOrchScores, getAllOrchInfo,
  getAllDelInfo, getAllMonthlyStats, getAllUpdateEvents, getAllRewardEvents,
  getAllClaimEvents, getAllWithdrawStakeEvents, getAllWithdrawFeesEvents,
  getAllTransferTicketEvents, getAllRedeemTicketEvents, getAllActivateEvents,
  getAllUnbondEvents, getAllStakeEvents, getAllCommissions, getAllTotalStakes,
  hasAnyRefresh, getAllRounds
} from "../actions/livepeer";
import { login } from "../actions/session";

// Shows a loading screen on first load and gets fresh data every refreshInterval milliseconds

// Refresh every 60 seconds
const refreshInterval = 60000;

// Refresh Events every 10 seconds
const refreshEventsInterval = 10000;

const Startup = (obj) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const dispatch = useDispatch();

  const refreshAllZeData = () => {
    console.log("Refreshing Livepeer data...");
    batch(() => {
      dispatch(getQuotes());
      dispatch(getBlockchainData());
      dispatch(getCurrentOrchestratorInfo());
    });
  }

  const refreshEvents = async () => {
    console.log("Checking for Events update...");
    const requiresRefresh = await hasAnyRefresh();
    if (requiresRefresh) {
      console.log("Events requires update...");
      batch(() => {
        dispatch(getAllMonthlyStats(true));
        dispatch(getAllUpdateEvents(true));
        dispatch(getAllRewardEvents(true));
        dispatch(getAllClaimEvents(true));
        dispatch(getAllWithdrawStakeEvents(true));
        dispatch(getAllWithdrawFeesEvents(true));
        dispatch(getAllTransferTicketEvents(true));
        dispatch(getAllRedeemTicketEvents(true));
        dispatch(getAllActivateEvents(true));
        dispatch(getAllUnbondEvents(true));
        dispatch(getAllStakeEvents(true));
      });
    }
  }

  const refreshLogin = () => {
    console.log("Logging in and getting visitor statistics...");
    batch(() => {
      dispatch(login());
      dispatch(getVisitorStats());
    });
  }

  const refreshENS = () => {
    console.log("Refreshing ENS data...");
    batch(() => {
      dispatch(getAllEnsDomains());
      dispatch(getAllEnsInfo());
    });
  }

  const refreshStaticProps = () => {
    console.log("Refreshing global data...");
    batch(() => {
      dispatch(getAllOrchInfo());
      dispatch(getAllDelInfo());
      dispatch(getAllOrchScores());
      dispatch(getAllMonthlyStats(false));
      dispatch(getAllCommissions());
      dispatch(getAllTotalStakes());
      dispatch(getAllUpdateEvents(false));
      dispatch(getAllRewardEvents(false));
      dispatch(getAllClaimEvents(false));
      dispatch(getAllWithdrawStakeEvents(false));
      dispatch(getAllWithdrawFeesEvents(false));
      dispatch(getAllTransferTicketEvents(false));
      dispatch(getAllRedeemTicketEvents(false));
      dispatch(getAllActivateEvents(false));
      dispatch(getAllUnbondEvents(false));
      dispatch(getAllStakeEvents(false));
      // TODO make it part of the hasAnyUpdate check
      dispatch(getAllRounds());
    });
  }

  useEffect(() => {
    refreshLogin();
    refreshAllZeData();
    refreshENS();
    refreshStaticProps();
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (refreshInterval) {
      const interval = setInterval(refreshAllZeData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval]);

  useEffect(() => {
    if (refreshEventsInterval) {
      const intervalEvents = setInterval(refreshEvents, refreshEventsInterval);
      return () => clearInterval(intervalEvents);
    }
  }, [refreshEventsInterval]);

  const texts = [
    "Preloading all the things...",
    "Preloading all the things...",
    "Preloading all the things...",
    "Speaking to the NSA...",
    "Loading...",
    "Loading...",
    "Loading...",
    "Loading...",
    "Loading...",
    "Loading..."
  ]

  if (isLoaded) {
    console.log("Rendering Application");
    return obj.children;
  } else {
    console.log("Rendering Loading Screen");
    return (
      <div className="stroke">
        <div className="verticalDivider" />
        <div className="row">
          <img alt="" src="livepeer.png" width="100em" height="100em" style={{ zIndex: 10 }} />
        </div>
        <div className="verticalDivider" />
        <div className="stroke roundedOpaque" style={{ width: 'unset', padding: '5em' }}>
          <h1>{texts[Math.floor(Math.random() * texts.length)]}</h1>
        </div>
      </div>
    )
  }
}

export default Startup;