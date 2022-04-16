import React, { useState } from 'react'
import '../style.css';
import {
  Navigate
} from "react-router-dom";
import { useSelector } from 'react-redux'
import Orchestrator from "../components/orchestratorViewer";

// Displays orchestrator info and embedded grafana panels

const Grafana = (obj) => {
  const livepeer = useSelector((state) => state.livepeerstate);
  const [redirectToHome, setRedirectToHome] = useState(false);
  if (redirectToHome) {
    return <Navigate push to="/" />;
  }
  // Generate component for displaying LPT and ETH price and price change
  let lptPrice = 0;
  let ethPrice = 0;
  let lptPriceChange24h = 0;
  let ethPriceChange24h = 0;
  if (livepeer.quotes) {
    if (livepeer.quotes.LPT) {
      lptPrice = livepeer.quotes.LPT.price.toFixed(2);
      lptPriceChange24h = livepeer.quotes.LPT.percent_change_24h.toFixed(2);
    }
    if (livepeer.quotes.ETH) {
      ethPrice = livepeer.quotes.ETH.price.toFixed(2);
      ethPriceChange24h = livepeer.quotes.ETH.percent_change_24h.toFixed(2);
    }
  }

  return (
    <div className="stroke" >
      <div className="verticalDivider" />
      <div className="row" >
        <button className="homeButton" onClick={() => {
          setRedirectToHome(true);
        }}>
          <img alt="" src="/livepeer.png" width="100em" height="100em" />
        </button>
      </div>
      <div className="verticalDivider" />
      <div className="stroke" >
        <div className="flexContainer makeItWide">
          <div className="stroke">
            <div className="stroke roundedOpaque">
              <div className="verticalDivider" />
              <div className="flexContainer">
                <div className="row">
                  <img alt="" src="livepeer.png" width="30" height="30" />
                  <p>${lptPrice}</p>
                  <p>({lptPriceChange24h}%)</p>
                </div>
                <div className="row">
                  <h2>Livepeer Orchestrator</h2>
                </div>
                <div className="row">
                  <img alt="" src="eth.png" width="30" height="30" />
                  <p>${ethPrice}</p>
                  <p>({ethPriceChange24h}%)</p>
                </div>
              </div>
              <div className="verticalDivider" />
              <div className="stroke roundedOpaqueDark">
                <div className="flexContainer fullMargin">
                  <Orchestrator thisOrchestrator={livepeer.thisOrchestrator} rootOnly={true} />
                </div>
                <div className="flexContainer stretchAndPad">
                  <iframe className="fullGrafana" src="https://grafana.stronk.tech/d-solo/71b6OZ0Gz/orchestrator-overview?orgId=1&refresh=15s&theme=dark&panelId=23763572144" height="200" frameBorder="0"></iframe>
                </div>
                <div className="flexContainer stretchAndPad">
                  <iframe className="fullGrafana" src="https://grafana.stronk.tech/d-solo/71b6OZ0Gz/orchestrator-overview?orgId=1&refresh=15s&theme=dark&panelId=23763572032" height="200" frameBorder="0"></iframe>
                </div>
                <div className="flexContainer stretchAndPad">
                  <iframe className="fullGrafana" src="https://grafana.stronk.tech/d-solo/71b6OZ0Gz/orchestrator-overview?orgId=1&from=now-12h&to=now&refresh=15s&theme=dark&panelId=23763572040" height="400" frameBorder="0"></iframe>
                </div>
                <div className="flexContainer stretchAndPad">
                  <iframe className="fullGrafana" src="https://grafana.stronk.tech/d-solo/71b6OZ0Gz/orchestrator-overview?orgId=1&refresh=15s&theme=dark&panelId=23763572056" height="200" frameBorder="0"></iframe>
                </div>
                <div className="flexContainer stretchAndPad">
                  <iframe className="fullGrafana" src="https://grafana.stronk.tech/d-solo/71b6OZ0Gz/orchestrator-overview?orgId=1&from=now-12h&to=now&refresh=15s&theme=dark&panelId=33" height="400" frameBorder="0"></iframe>
                </div>
              </div>
              <div className="verticalDivider" />
              <div className="row">
                <a href="https://grafana.stronk.tech/d/71b6OZ0Gz/orchestrator-overview?orgId=1&refresh=5s&theme=dark">
                  <button className="waveButton">
                    <img alt="" src="grafana.png" width="30" height="30" />
                    <p>Full Statistics</p>
                  </button>
                </a>
              </div>
              <div className="verticalDivider" />
            </div>
          </div>
          <div className="smallVerticalDivider" />
        </div>
      </div>
      <div className="verticalDivider" />
    </div>
  );
}

export default Grafana;
