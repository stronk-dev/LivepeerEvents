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
  }

  const refreshLogin = () => {
    console.log("Logging in and getting visitor statistics...");
    batch(() => {
      dispatch(login());
      dispatch(getVisitorStats());
    });
    setIsLoaded(true);
  }

  useEffect(() => {
    refreshLogin();
    refreshAllZeData();
    if (refreshInterval) {
      const interval = setInterval(refreshAllZeData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval]);

  if(isLoaded){
    console.log("Rendering Application");
    return obj.children;
  }else{
    console.log("Rendering Loading Screen");
    return <div className="stroke" style={{ padding: 0 }}>
    <div className="row" style={{ margin: 0, padding: 0 }}>
      <img alt="" src="livepeer.png" width="100em" height="100em" style={{ zIndex: 10 }} />
    </div>
    <div className="flexContainer">
      <div className="stroke roundedOpaque">
        <div className="row">
          <h3>Loading...</h3>
        </div>
      </div>
    </div>
    <div className="alwaysOnBottomRight" style={{ margin: 0, padding: 0 }}>
      <h6 className="lightText" style={{ margin: 0, padding: 0 }}>
        nframe.nl
      </h6>
    </div>
  </div>
  }
}

export default Startup;