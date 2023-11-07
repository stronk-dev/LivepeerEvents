import React, { useState } from "react";
import "../style.css";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import RetroHitCounter from "react-retro-hit-counter";
import ContractPrices from "../components/ContractPrices";

// Index of all sub-pages on this website

const Home = (obj) => {
  const userstate = useSelector((state) => state.userstate);
  const [redirectToLPT, setRedirectToLPT] = useState(false);
  const [redirectToStats, setRedirectToStats] = useState(false);
  const [thisChad, setChad] = useState("");

  if (redirectToLPT) {
    return <Navigate push to="/livepeer" />;
  }
  if (redirectToStats) {
    return <Navigate push to="/stats" />;
  }

  // Get amount of unique IP's which have visited this website
  var totalVisitorCount = 0;
  if (userstate.visitorStats) {
    totalVisitorCount = userstate.visitorStats.totalVisitorCount;
  }

  if (thisChad == "") {
    const randomChad = performance.now();
    const chadSource = "https://stronk.rocks/avatar.png?" + randomChad;
    setChad(chadSource);
  }

  return (
    <div className="stroke">
      <div className="verticalDivider" />
      <div className="row">
        <img
          alt=""
          src="android-chrome-512x512.png"
          width="100em"
          style={{ zIndex: 10 }}
        />
      </div>
      <div className="verticalDivider" />

      <div
        className="stroke roundedOpaque"
        style={{ maxWidth: "800px", marginBottom: "1em" }}
      >
        <div className="row" style={{ marginTop: "1em" }}>
          <p>
            On this page you will find an overview of everything related to{" "}
            <strong>captain-stronk.eth</strong>
          </p>
        </div>

        <div className="verticalDivider" />

        <div className="row">
          <h3>Stronk Orchestrator</h3>
        </div>
        <a
          href="https://grafana.stronk.tech/d/71b6OZ0Gz/orchestrator-overview"
          style={{ cursor: "alias" }}
          target="_blank"
          rel="noopener noreferrer"
        >
          <button className="waveButton" style={{ cursor: "alias" }}>
            <div className="row">
              <img
                alt=""
                src={thisChad}
                width="20em"
                height="20em"
                style={{ margin: 0 }}
              />
              <p style={{ padding: "0.3em", flex: 1, flexGrow: 3 }}>
                Health and Statistics
              </p>
            </div>
          </button>
        </a>

        <a
          href="https://forum.livepeer.org/t/transcoder-campaign-captain-stronk"
          style={{ cursor: "alias" }}
          target="_blank"
          rel="noopener noreferrer"
        >
          <button className="waveButton" style={{ cursor: "alias" }}>
            <div className="row">
              <img
                alt=""
                src="livepeer.png"
                width="20em"
                height="20em"
                style={{ margin: 0 }}
              />
              <p style={{ padding: "0.3em", flex: 1, flexGrow: 3 }}>
                News and Updates
              </p>
            </div>
          </button>
        </a>

        <div
          className="row"
          style={{ width: "unset", marginTop: "1em", marginBottom: "1em" }}
        >
          <a
            className="selectOrch"
            style={{ padding: "0.2em", cursor: "alias" }}
            target="_blank"
            rel="noopener noreferrer"
            href={
              "https://explorer.livepeer.org/accounts/0x847791cbf03be716a7fe9dc8c9affe17bd49ae5e/delegating"
            }
          >
            <img alt="" src="livepeer.png" width="20em" height="20em" />
            <span>Stake with captain-stronk.eth</span>
          </a>
        </div>

        <div className="row">
          <h3>Stronk Broadcaster</h3>
        </div>

        <a
          href="https://video.stronk.rocks/"
          style={{ cursor: "alias" }}
          target="_blank"
          rel="noopener noreferrer"
        >
          <button className="waveButton" style={{ cursor: "alias" }}>
            <div className="row">
              <img
                alt=""
                src="android-chrome-512x512.png"
                width="20em"
                height="20em"
                style={{ margin: 0 }}
              />
              <p style={{ padding: "0.3em", flex: 1, flexGrow: 3 }}>
                StreamCrafter demo
              </p>
            </div>
          </button>
        </a>

        <a
          href="https://grafana.stronk.tech/d/lp-global-orch-instances/livepeer-global-overview"
          style={{ cursor: "alias" }}
          target="_blank"
          rel="noopener noreferrer"
        >
          <button className="waveButton" style={{ cursor: "alias" }}>
            <div className="row">
              <img
                alt=""
                src="grafana.png"
                width="20em"
                height="20em"
                style={{ margin: 0 }}
              />
              <p style={{ padding: "0.3em", flex: 1, flexGrow: 3 }}>
                Global Orchestrator tracker
              </p>
            </div>
          </button>
        </a>

        <a
          href="https://grafana.stronk.tech/d/lp-orchestrator/livepeer-orchestrator-overview"
          style={{ cursor: "alias" }}
          target="_blank"
          rel="noopener noreferrer"
        >
          <button className="waveButton" style={{ cursor: "alias" }}>
            <div className="row">
              <img
                alt=""
                src="grafana.png"
                width="20em"
                height="20em"
                style={{ margin: 0 }}
              />
              <p style={{ padding: "0.3em", flex: 1, flexGrow: 3 }}>
                Regional health tracker
              </p>
            </div>
          </button>
        </a>

        <a
          href="https://grafana.stronk.tech/d/lp-regional-orchestrator/livepeer-regional-overview"
          style={{ cursor: "alias" }}
          target="_blank"
          rel="noopener noreferrer"
        >
          <button className="waveButton" style={{ cursor: "alias" }}>
            <div className="row">
              <img
                alt=""
                src="grafana.png"
                width="20em"
                height="20em"
                style={{ margin: 0 }}
              />
              <p style={{ padding: "0.3em", flex: 1, flexGrow: 3 }}>
                Orchestrator health tracker
              </p>
            </div>
          </button>
        </a>

        <div
          className="row"
          style={{ width: "unset", marginTop: "1em", marginBottom: "1em" }}
        >
          <a
            className="selectOrch"
            style={{ padding: "0.2em", cursor: "alias" }}
            target="_blank"
            rel="noopener noreferrer"
            href={
              "https://explorer.livepeer.org/accounts/0x847791cbf03be716a7fe9dc8c9affe17bd49ae5e/delegating"
            }
          >
            <img alt="" src="livepeer.png" width="20em" height="20em" />
            <span>Stake with captain-stronk.eth</span>
          </a>
        </div>

        <div className="row">
          <h3>Stronk Utilities</h3>
        </div>

        <button
          className="waveButton"
          onClick={() => {
            setRedirectToLPT(true);
          }}
        >
          <div className="row">
            <img
              alt=""
              src="arb.svg"
              width="20em"
              height="20em"
              style={{ margin: 0 }}
            />
            <p style={{ padding: "0.3em", flex: 1, flexGrow: 3 }}>
              Smart contract explorer
            </p>
          </div>
        </button>
        <button
          className="waveButton"
          onClick={() => {
            setRedirectToStats(true);
          }}
        >
          <div className="row">
            <img
              alt=""
              src="stats.jpg"
              width="20em"
              height="20em"
              style={{ margin: 0 }}
            />
            <p style={{ padding: "0.3em", flex: 1, flexGrow: 3 }}>
              Monthly smart contract summary
            </p>
          </div>
        </button>
        <a
          href="https://dune.com/stronk/livepeer-arbitrum"
          style={{ cursor: "alias" }}
          target="_blank"
          rel="noopener noreferrer"
        >
          <button className="waveButton" style={{ cursor: "alias" }}>
            <div className="row">
              <img
                alt=""
                src="dune.png"
                width="20em"
                height="20em"
                style={{ margin: 0 }}
              />
              <p style={{ padding: "0.3em", flex: 1, flexGrow: 3 }}>
                Smart contract graphs
              </p>
            </div>
          </button>
        </a>
        <a
          href="https://github.com/stronk-dev/MistLoadLivepeer"
          style={{ cursor: "alias" }}
          target="_blank"
          rel="noopener noreferrer"
        >
          <button className="waveButton" style={{ cursor: "alias" }}>
            <div className="row">
              <img
                alt=""
                src="github.png"
                width="20em"
                height="20em"
                style={{ margin: 0 }}
              />
              <p style={{ padding: "0.3em", flex: 1, flexGrow: 3 }}>
                Orchestrator load testing
              </p>
            </div>
          </button>
        </a>
        <a
          href="https://hedgedoc.ddvtech.com/wpwHEXMFTueUM7jqhikTvw?view"
          style={{ cursor: "alias" }}
          target="_blank"
          rel="noopener noreferrer"
        >
          <button className="waveButton" style={{ cursor: "alias" }}>
            <div className="row">
              <img
                alt=""
                src="setup.svg"
                width="20em"
                height="20em"
                style={{ margin: 0 }}
              />
              <p style={{ padding: "0.3em", flex: 1, flexGrow: 3 }}>
                Orchestrator Linux setup guide
              </p>
            </div>
          </button>
        </a>

        <div
          className="row"
          style={{ width: "unset", marginTop: "1em", marginBottom: "1em" }}
        >
          <a
            className="selectOrch"
            style={{ padding: "0.2em", cursor: "alias" }}
            target="_blank"
            rel="noopener noreferrer"
            href={
              "https://explorer.livepeer.org/accounts/0x847791cbf03be716a7fe9dc8c9affe17bd49ae5e/delegating"
            }
          >
            <img alt="" src="livepeer.png" width="20em" height="20em" />
            <span>Stake with captain-stronk.eth</span>
          </a>
        </div>

        <div className="row">
          <h3>Stronk Tips</h3>
        </div>

        <a
          href="https://www.livepeer.tools/"
          style={{ cursor: "alias" }}
          target="_blank"
          rel="noopener noreferrer"
        >
          <button className="waveButton" style={{ cursor: "alias" }}>
            <div className="row">
              <img
                alt=""
                src="xodeapp.png"
                width="20em"
                height="20em"
                style={{ margin: 0 }}
              />
              <p style={{ padding: "0.3em", flex: 1, flexGrow: 3 }}>
                Orchestrator payouts & earnings
              </p>
            </div>
          </button>
        </a>

        <a
          href="https://livepeer-test-broadcaster.ad-astra.video/"
          style={{ cursor: "alias" }}
          target="_blank"
          rel="noopener noreferrer"
        >
          <button className="waveButton" style={{ cursor: "alias" }}>
            <div className="row">
              <img
                alt=""
                src="ad-astra-video.png"
                width="20em"
                height="20em"
                style={{ margin: 0 }}
              />
              <p style={{ padding: "0.3em", flex: 1, flexGrow: 3 }}>
                Orchestrator test streams
              </p>
            </div>
          </button>
        </a>

        <div
          className="row"
          style={{ width: "unset", marginTop: "1em", marginBottom: "1em" }}
        >
          <a
            className="selectOrch"
            style={{ padding: "0.2em", cursor: "alias" }}
            target="_blank"
            rel="noopener noreferrer"
            href={
              "https://explorer.livepeer.org/accounts/0x847791cbf03be716a7fe9dc8c9affe17bd49ae5e/delegating"
            }
          >
            <img alt="" src="livepeer.png" width="20em" height="20em" />
            <span>Stake with captain-stronk.et9h</span>
          </a>
        </div>

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
        <div className="verticalDivider" />
      </div>
    </div>
  );
};

export default Home;
