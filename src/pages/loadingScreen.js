import React, { useEffect, useState } from 'react'
import { useDispatch, batch } from 'react-redux'
import {
  getVisitorStats
} from "../actions/user";
import {
  getQuotes, getBlockchainData, getEvents, getCurrentOrchestratorInfo, getTickets
} from "../actions/livepeer";
import { login } from "../actions/session";

// Shows a loading screen on first load and gets fresh data every refreshInterval milliseconds

// Refresh every 60 seconds
const refreshInterval = 60000;

const Startup = (obj) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const dispatch = useDispatch();

  const refreshAllZeData = () => {
    console.log("Refreshing data...");
    batch(() => {
      dispatch(getQuotes());
      dispatch(getEvents());
      dispatch(getBlockchainData());
      dispatch(getCurrentOrchestratorInfo());
      dispatch(getTickets());
    });
  }
  
  const refreshLogin = () => {
    console.log("Logging in and getting visitor statistics...");
    batch(() => {
      dispatch(login());
      dispatch(getVisitorStats());
    });
  }
  
  useEffect(() => {
    refreshLogin();
    refreshAllZeData();
    setIsLoaded(true);
    if (refreshInterval) {
      const interval = setInterval(refreshAllZeData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval]);

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