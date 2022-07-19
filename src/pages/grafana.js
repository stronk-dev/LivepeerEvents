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


  return (
    <div className="stroke" >
      <div className="verticalDivider" />
      <div className="row" >
        <button className="homeButton" onClick={() => {
          setRedirectToHome(true);
        }}>
           <div style={{fontSize: '4em'}}>🏠</div>
        </button>
      </div>
      <div className="verticalDivider" />
      <div className="stroke" >
        <div className="flexContainer makeItWide">
          <div className="stroke">
            <div className="stroke roundedOpaque">
              <div className="verticalDivider" />
              <div className="flexContainer">
                <div className="row" onClick={() => {
                  setRedirectToHome(true);
                }}>
                  <h2>Livepeer Orchestrator</h2>
                </div>
              </div>
              <div className="verticalDivider" />
              <div className="stroke roundedOpaqueDark">
                <div className="row" style={{ width: 'unset', marginTop: '1em', marginBottom: '1em' }}>
                  <a className="selectOrch" style={{ padding: '0.2em', cursor: 'alias' }} target="_blank" rel="noopener noreferrer" href={"https://explorer.livepeer.org/accounts/0x847791cbf03be716a7fe9dc8c9affe17bd49ae5e/delegating"} >
                    <img alt="" src="livepeer.png" width="20em" height="20em" />
                    <span className="lightTextAlt">Stake with captain-chad.eth</span>
                  </a>
                </div>
                <div className="flexContainer stretchAndPad">
                  <iframe className="halfGrafana" src="https://grafana.stronk.tech/d-solo/71b6OZ0Gz/orchestrator-overview?orgId=1&refresh=15s&theme=dark&panelId=23763572081" height="200" frameBorder="0"></iframe>
                  <iframe className="halfGrafana" src="https://grafana.stronk.tech/d-solo/71b6OZ0Gz/orchestrator-overview?orgId=1&refresh=15s&theme=dark&panelId=23763572082" height="200" frameBorder="0"></iframe>
                </div>
                <div className="flexContainer stretchAndPad">
                  <iframe className="halfGrafana" src="https://grafana.stronk.tech/d-solo/71b6OZ0Gz/orchestrator-overview?orgId=1&refresh=15s&theme=dark&panelId=75" height="200" frameBorder="0"></iframe>
                  <iframe className="halfGrafana" src="https://grafana.stronk.tech/d-solo/71b6OZ0Gz/orchestrator-overview?orgId=1&refresh=15s&theme=dark&panelId=23763572196" height="200" frameBorder="0"></iframe>
                </div>
                <div className="flexContainer stretchAndPad">
                  <iframe className="halfGrafana" src="https://grafana.stronk.tech/d-solo/71b6OZ0Gz/orchestrator-overview?orgId=1&refresh=15s&theme=dark&panelId=79" height="200" frameBorder="0"></iframe>
                  <iframe className="halfGrafana" src="https://grafana.stronk.tech/d-solo/71b6OZ0Gz/orchestrator-overview?orgId=1&refresh=15s&theme=dark&panelId=83" height="200" frameBorder="0"></iframe>
                </div>
                <div className="row" style={{ width: 'unset', marginTop: '1em', marginBottom: '1em' }}>
                  <a className="selectOrch" style={{ padding: '0.2em', cursor: 'alias' }} target="_blank" rel="noopener noreferrer" href={"https://explorer.livepeer.org/accounts/0x847791cbf03be716a7fe9dc8c9affe17bd49ae5e/delegating"} >
                    <img alt="" src="livepeer.png" width="20em" height="20em" />
                    <span className="lightTextAlt">Stake with captain-chad.eth</span>
                  </a>
                </div>
                <div className="flexContainer stretchAndPad">
                  <iframe className="fullGrafana" src="https://grafana.stronk.tech/d-solo/71b6OZ0Gz/orchestrator-overview?orgId=1&from=now-12h&to=now&refresh=15s&theme=dark&panelId=23763572146" height="200" frameBorder="0"></iframe>
                </div>
                <div className="flexContainer stretchAndPad">
                  <iframe className="fullGrafana" src="https://grafana.stronk.tech/d-solo/71b6OZ0Gz/orchestrator-overview?orgId=1&refresh=15s&theme=dark&panelId=23763572108" height="400" frameBorder="0"></iframe>
                </div>
                <div className="row" style={{ width: 'unset', marginTop: '1em', marginBottom: '1em' }}>
                  <a className="selectOrch" style={{ padding: '0.2em', cursor: 'alias' }} target="_blank" rel="noopener noreferrer" href={"https://explorer.livepeer.org/accounts/0x847791cbf03be716a7fe9dc8c9affe17bd49ae5e/delegating"} >
                    <img alt="" src="livepeer.png" width="20em" height="20em" />
                    <span className="lightTextAlt">Stake with captain-chad.eth</span>
                  </a>
                </div>
                <div className="flexContainer stretchAndPad">
                  <iframe className="fullGrafana" src="https://grafana.stronk.tech/d-solo/71b6OZ0Gz/orchestrator-overview?orgId=1&from=now-12h&to=now&refresh=15s&theme=dark&panelId=23763572195" height="200" frameBorder="0"></iframe>
                </div>
                <div className="flexContainer stretchAndPad">
                  <iframe className="fullGrafana" src="https://grafana.stronk.tech/d-solo/71b6OZ0Gz/orchestrator-overview?orgId=1&refresh=15s&theme=dark&panelId=23763572161" height="400" frameBorder="0"></iframe>
                </div>
                <div className="row" style={{ width: 'unset', marginTop: '1em', marginBottom: '1em' }}>
                  <a className="selectOrch" style={{ padding: '0.2em', cursor: 'alias' }} target="_blank" rel="noopener noreferrer" href={"https://explorer.livepeer.org/accounts/0x847791cbf03be716a7fe9dc8c9affe17bd49ae5e/delegating"} >
                    <img alt="" src="livepeer.png" width="20em" height="20em" />
                    <span className="lightTextAlt">Stake with captain-chad.eth</span>
                  </a>
                </div>
                <div className="flexContainer stretchAndPad">
                  <iframe className="fullGrafana" src="https://grafana.stronk.tech/d-solo/71b6OZ0Gz/orchestrator-overview?orgId=1&refresh=15s&theme=dark&panelId=23763572145" height="200" frameBorder="0"></iframe>
                </div>
                <div className="flexContainer stretchAndPad">
                  <iframe className="fullGrafana" src="https://grafana.stronk.tech/d-solo/71b6OZ0Gz/orchestrator-overview?orgId=1&refresh=15s&theme=dark&panelId=109" height="400" frameBorder="0"></iframe>
                </div>
                <div className="row" style={{ width: 'unset', marginTop: '1em', marginBottom: '1em' }}>
                  <a className="selectOrch" style={{ padding: '0.2em', cursor: 'alias' }} target="_blank" rel="noopener noreferrer" href={"https://explorer.livepeer.org/accounts/0x847791cbf03be716a7fe9dc8c9affe17bd49ae5e/delegating"} >
                    <img alt="" src="livepeer.png" width="20em" height="20em" />
                    <span className="lightTextAlt">Stake with captain-chad.eth</span>
                  </a>
                </div>
                <div className="flexContainer stretchAndPad">
                  <iframe className="fullGrafana" src="https://grafana.stronk.tech/d-solo/71b6OZ0Gz/orchestrator-overview?orgId=1&refresh=15s&theme=dark&panelId=23763572032" height="200" frameBorder="0"></iframe>
                </div>
                <div className="flexContainer stretchAndPad">
                  <iframe className="fullGrafana" src="https://grafana.stronk.tech/d-solo/71b6OZ0Gz/orchestrator-overview?orgId=1&from=now-12h&to=now&refresh=15s&theme=dark&panelId=23763572040" height="400" frameBorder="0"></iframe>
                </div>
                <div className="row" style={{ width: 'unset', marginTop: '1em', marginBottom: '1em' }}>
                  <a className="selectOrch" style={{ padding: '0.2em', cursor: 'alias' }} target="_blank" rel="noopener noreferrer" href={"https://explorer.livepeer.org/accounts/0x847791cbf03be716a7fe9dc8c9affe17bd49ae5e/delegating"} >
                    <img alt="" src="livepeer.png" width="20em" height="20em" />
                    <span className="lightTextAlt">Stake with captain-chad.eth</span>
                  </a>
                </div>
              </div>
              <div className="verticalDivider" />
              <div className="row">
                <a href="https://grafana.stronk.tech/d/71b6OZ0Gz/orchestrator-overview?orgId=1&refresh=5s&theme=dark">
                  <button className="waveButton">
                    <img alt="" src="grafana.png" width="30" height="30" />
                    <p>All Statistics</p>
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
