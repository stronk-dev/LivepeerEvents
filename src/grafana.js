import React, { useEffect, useState } from "react";
import './style.css';
import {
  Navigate, useParams
} from "react-router-dom";

const Grafana = () => {
  let params = useParams();
  const [redirectToHome, setRedirectToHome] = useState(false);

  useEffect(() => {

  }, [])

  if (redirectToHome) {
    return <Navigate push to="/" />;
  }
  return (
    <div className="stroke" style={{ margin: 0, padding: 0 }}>
      <div className="row" style={{ margin: 0, padding: 0 }}>
        <button className="homeButton" onClick={() => {
          setRedirectToHome(true);
        }}>
          <img alt="" src="/livepeer.png" width="100em" height="100em" />
        </button>
      </div>
      <div className="stroke" style={{ margin: 0, padding: 0 }}>
        <div className="flexContainer">
          <div className="stroke" style={{ marginTop: 0, marginBottom: 5, paddingBottom: 0 }}>
            <div className="stroke roundedOpaque" style={{}}>
              <div className="row">
                <h2> <img alt="" src="livepeer.png" width="30" height="30" /> <a href="https://explorer.livepeer.org/accounts/0x847791cbf03be716a7fe9dc8c9affe17bd49ae5e/">Livepeer Orchestrator</a></h2>
              </div>
              <div className="stroke roundedOpaque" style={{ borderRadius: "1em", backgroundColor: "#111217" }}>
              <div className="flexContainer" style={{ justifyContent: "center" }}>
                  <iframe className="halfGrafana" src="https://grafana.stronk.tech/d-solo/71b6OZ0Gz/orchestrator-overview?orgId=1&refresh=5s&theme=dark&panelId=23763572081" height="200" frameBorder="0"></iframe>
                  <iframe className="halfGrafana" src="https://grafana.stronk.tech/d-solo/71b6OZ0Gz/orchestrator-overview?orgId=1&refresh=5s&theme=dark&panelId=23763572082" height="200" frameBorder="0"></iframe>
                </div>
                <div className="flexContainer" style={{ justifyContent: "center" }}>
                  <iframe className="fullGrafana" src="https://grafana.stronk.tech/d-solo/71b6OZ0Gz/orchestrator-overview?orgId=1&refresh=5s&theme=dark&panelId=23763572014" height="200" frameBorder="0"></iframe>
                </div>
                <div className="flexContainer" style={{ justifyContent: "center" }}>
                  <iframe className="fullGrafana" src="https://grafana.stronk.tech/d-solo/71b6OZ0Gz/orchestrator-overview?orgId=1&refresh=5s&theme=dark&panelId=23763572077" height="400" frameBorder="0"></iframe>
                </div>
                <div className="flexContainer" style={{ justifyContent: "center" }}>
                  <iframe className="fullGrafana" src="https://grafana.stronk.tech/d-solo/71b6OZ0Gz/orchestrator-overview?orgId=1&refresh=5s&theme=dark&panelId=23763572056" height="200" frameBorder="0"></iframe>
                </div>
                <div className="flexContainer" style={{ justifyContent: "center" }}>
                  <iframe className="fullGrafana" src="https://grafana.stronk.tech/d-solo/71b6OZ0Gz/orchestrator-overview?orgId=1&refresh=5s&theme=dark&panelId=23763572032" height="200" frameBorder="0"></iframe>
                </div>
                <div className="flexContainer" style={{ justifyContent: "center" }}>
                  <iframe className="fullGrafana" src="https://grafana.stronk.tech/d-solo/71b6OZ0Gz/orchestrator-overview?orgId=1&from=now-2d&to=now&refresh=5s&theme=dark&panelId=23763572040" height="400" frameBorder="0"></iframe>
                </div>
                <div className="row">
                  <a href="https://grafana.stronk.tech/d/71b6OZ0Gz/orchestrator-overview?orgId=1&refresh=5s&theme=dark">
                    <button className="waveButton">
                      <img alt="" src="grafana.png" width="30" height="30" />
                      <p>Full Statistics</p>
                    </button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Grafana;