import React, { useEffect, useState } from 'react'
import { useDispatch, batch } from 'react-redux'
import {
  getVisitorStats
} from "./actions/user";
import {
  getQuotes, getBlockchainData, getEvents, getCurrentOrchestratorInfo
} from "./actions/livepeer";
import { login } from "./actions/session";

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
    });
    setIsLoaded(true);
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
    if (refreshInterval) {
      const interval = setInterval(refreshAllZeData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval]);

  if (isLoaded) {
    console.log("Rendering Application");
    return obj.children;
  } else {
    console.log("Rendering Loading Screen");
    return (
      <div className="stroke">
        <div className="row">
          <img alt="" src="livepeer.png" width="200em" height="200em" style={{ zIndex: 10 }} />
        </div>
        <div className="stroke roundedOpaque" style={{ width: 'unset', padding: '5em' }}>
          <div className="stroke">
            <h1>Loading...</h1>
          </div>
        </div>
      </div>
    )
  }
}

export default Startup;