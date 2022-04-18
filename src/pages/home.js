import React, { useState } from 'react';
import '../style.css';
import {
  Navigate
} from "react-router-dom";
import { useSelector } from 'react-redux';
import RetroHitCounter from 'react-retro-hit-counter';
// Index of all sub-pages on this website

const Home = (obj) => {
  const userstate = useSelector((state) => state.userstate);
  const [redirectToGrafana, setRedirectToGrafana] = useState(false);
  const [redirectToLPT, setRedirectToLPT] = useState(false);
  const [redirectToTickets, setRedirectToTickets] = useState(false);
  if (redirectToGrafana) {
    return <Navigate push to="/orchestrator" />;
  }
  if (redirectToLPT) {
    return <Navigate push to="/livepeer" />;
  }
  if (redirectToTickets) {
    return <Navigate push to="/tickets" />;
  }
  // Get amount of unique IP's which have visited this website
  var totalVisitorCount = 0;
  if (userstate.visitorStats) {
    totalVisitorCount = userstate.visitorStats.totalVisitorCount;
  }

  return (
    <div className="stroke">
      <div className="verticalDivider"/>
      <div className="row">
        <img alt="" src="livepeer.png" width="100em" height="100em" style={{ zIndex: 10 }} />
      </div>
      <div className="verticalDivider" />
      <div className="flexContainer">
        <div className="stroke roundedOpaque">
          <div className="verticalDivider" />
          <div className="row">
            <h3>Home</h3>
          </div>
          <div className="row">
            <a href="https://github.com/stronk-dev/LivepeerEvents">
              <button className="waveButton">
                <p>🧱 Source Code 🏠</p>
              </button>
            </a>
          </div>
          <div className="row">
            <button className="waveButton" onClick={() => {
              setRedirectToGrafana(true);
            }}>
              <p>🚀 Orchestrator 🌑</p>
            </button>
          </div>
          <div className="row">
            <button className="waveButton" onClick={() => {
              setRedirectToLPT(true);
            }}>
              <p>🔎 Blockchain 🕵️</p>
            </button>
          </div>
          <div className="row">
            <button className="waveButton" onClick={() => {
              setRedirectToTickets(true);
            }}>
              <p>📈 Statistics 💰</p>
            </button>
          </div>
          <div className="verticalDivider" />
        </div>
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
