import React, { useState } from 'react';
import '../style.css';
import {
  Navigate
} from "react-router-dom";
import { useSelector } from 'react-redux';
import RetroHitCounter from 'react-retro-hit-counter';
import ContractPrices from '../components/ContractPrices';

// Index of all sub-pages on this website

const Home = (obj) => {
  const userstate = useSelector((state) => state.userstate);
  const livepeer = useSelector((state) => state.livepeerstate);
  const [redirectToGrafana, setRedirectToGrafana] = useState(false);
  const [redirectToLPT, setRedirectToLPT] = useState(false);
  const [redirectToStats, setRedirectToStats] = useState(false);
  const [redirectToGraphs, setRedirectToGraphs] = useState(false);
  const [thisChad, setChad] = useState("");
  
  if (redirectToGrafana) {
    return <Navigate push to="/stake" />;
  }
  if (redirectToLPT) {
    return <Navigate push to="/livepeer" />;
  }
  if (redirectToStats) {
    return <Navigate push to="/stats" />;
  }

  if (redirectToGraphs) {
    return <Navigate push to="/graphs" />;
  }
  // Get amount of unique IP's which have visited this website
  var totalVisitorCount = 0;
  if (userstate.visitorStats) {
    totalVisitorCount = userstate.visitorStats.totalVisitorCount;
  }

  if (thisChad == ""){
    const randomChad = performance.now();
    const chadSource = "https://stronk.rocks/avatar.png?" + randomChad;
    setChad(chadSource);
  }

  return (
    <div className="stroke">
      <div className="verticalDivider" />
      <div className="row">
        <img alt="" src="android-chrome-512x512.png" width="100em" style={{ zIndex: 10 }} />
      </div>
      <div className="verticalDivider" />
      <div className="stroke roundedOpaque" style={{ maxWidth: '400px' }}>
        <div className="verticalDivider" />
        <div className="row">
          <h3>Home</h3>
        </div>
        <button className="waveButton" onClick={() => {
          setRedirectToGrafana(true);
        }}>
          <div className="row">
            <img alt="" src={thisChad} width="20em" height="20em" style={{ margin: 0 }} />
            <p style={{ padding: '0.3em', flex: 1, flexGrow: 3 }}>Orchestrator</p>
          </div>
        </button>
        <button className="waveButton" onClick={() => {
          setRedirectToLPT(true);
        }}>
          <div className="row">
            <img alt="" src="arb.svg" width="20em" height="20em" style={{ margin: 0 }} />
            <p style={{ padding: '0.3em', flex: 1, flexGrow: 3 }}>Contract Events</p>
          </div>
        </button>
        <button className="waveButton" onClick={() => {
          setRedirectToStats(true);
        }}>
          <div className="row">
            <img alt="" src="stats.jpg" width="20em" height="20em" style={{ margin: 0 }} />
            <p style={{ padding: '0.3em', flex: 1, flexGrow: 3 }}>Statistics</p>
          </div>
        </button>
        {/* <div className="row">
            <button className="waveButton" onClick={() => {
              setRedirectToGraphs(true);
            }}>
              <p>📉 Graphs 📊</p>
            </button>
          </div> */}
        <div className="verticalDivider" />
        <div className="row">
          <p>External Links:</p>
        </div>
        <a href="https://forum.livepeer.org/t/transcoder-campaign-captain-stronk">
          <button className="waveButton">
            <div className="row">
              <img alt="" src="livepeer.png" width="20em" height="20em" style={{ margin: 0 }} />
              <p style={{ padding: '0.3em', flex: 1, flexGrow: 3 }}>Transcoder Campaign</p>
            </div>
          </button>
        </a>
        <a href="https://github.com/stronk-dev/LivepeerEvents">
          <button className="waveButton">
            <div className="row">
              <img alt="" src="github.png" width="20em" height="20em" style={{ margin: 0 }} />
              <p style={{ padding: '0.3em', flex: 1, flexGrow: 3 }}>Source Code</p>
            </div>
          </button>
        </a>
        <a href="https://grafana.stronk.tech/d/b8FvMmmVk/orchestrator-tracker">
          <button className="waveButton">
            <div className="row">
              <img alt="" src="grafana.png" width="20em" height="20em" style={{ margin: 0 }} />
              <p style={{ padding: '0.3em', flex: 1, flexGrow: 3 }}>Orchestrator Tracker</p>
            </div>
          </button>
        </a>
        <a href="https://dune.com/stronk/livepeer-arbitrum">
          <button className="waveButton">
            <div className="row">
              <img alt="" src="dune.png" width="20em" height="20em" style={{ margin: 0 }} />
              <p style={{ padding: '0.3em', flex: 1, flexGrow: 3 }}>Better Stats</p>
            </div>
          </button>
        </a>
        <a href="https://hedgedoc.ddvtech.com/wpwHEXMFTueUM7jqhikTvw?view">
          <button className="waveButton">
            <div className="row">
              <img alt="" src="setup.svg" width="20em" height="20em" style={{ margin: 0 }} />
              <p style={{ padding: '0.3em', flex: 1, flexGrow: 3 }}>Orchestrator Setup</p>
            </div>
          </button>
        </a>
        <div className="verticalDivider" />
        <div className="row">
          <ContractPrices quotes={livepeer.quotes} blockchains={livepeer.blockchains} />
        </div>
        {/* <div className="verticalDivider" />
          <div className="row">
            <h3>Status</h3>
          </div>
          <div className="row">
            <p>There was an issue with Events getting duplicated. The website might become unavailable from time to time while the issue is being fixed.</p>
          </div> */}
        <div className="verticalDivider" />
      </div>
      <div className="alwaysOnBottom showNeverOnMobile">
        <div className="row">
          <RetroHitCounter
            hits={totalVisitorCount}
            withBorder={true}
            withGlow={true}
            minLength={4}
            size={50}
            padding={6}
            digitSpacing={4}
            segmentThickness={5}
            segmentSpacing={0.6}
            segmentActiveColor="#76FF03"
            segmentInactiveColor="#315324"
            backgroundColor="#222222"
            borderThickness={6}
            glowStrength={0.4}
          />
        </div>
        <h6 className="lightText">
          nframe.nl
        </h6>
      </div>
    </div>
  )
}

export default Home;
