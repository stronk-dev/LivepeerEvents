import * as React from "react";
import './style.css';
import {
  Navigate
} from "react-router-dom";
import { connect } from "react-redux";
import {
  getQuotes, getCurrentOrchestratorInfo
} from "./actions/livepeer";
import Orchestrator from "./orchestratorViewer";

const mapStateToProps = (state) => {
  return {
    session: state.session,
    userstate: state.userstate,
    errors: state.errors,
    livepeer: state.livepeerstate
  }
};

const mapDispatchToProps = dispatch => ({
  getQuotes: () => dispatch(getQuotes()),
  getCurrentOrchestratorInfo: () => dispatch(getCurrentOrchestratorInfo())
});

class Grafana extends React.Component {
  state = {
    redirectToHome: false,
  };

  constructor(props) {
    super(props);
  }

  render() {
    if (this.state.redirectToHome) {
      return <Navigate push to="/" />;
    }

    let lptPrice = 0;
    let ethPrice = 0;
    let lptPriceChange24h = 0;
    let ethPriceChange24h = 0;
    if (this.props.livepeer.quotes) {
      if (this.props.livepeer.quotes.LPT) {
        lptPrice = this.props.livepeer.quotes.LPT.price.toFixed(2);
        lptPriceChange24h = this.props.livepeer.quotes.LPT.percent_change_24h.toFixed(2);
      }
      if (this.props.livepeer.quotes.ETH) {
        ethPrice = this.props.livepeer.quotes.ETH.price.toFixed(2);
        ethPriceChange24h = this.props.livepeer.quotes.ETH.percent_change_24h.toFixed(2);
      }
    }

    return (
      <div className="stroke" style={{ margin: 0, padding: 0 }}>
        <div className="row" style={{ margin: 0, padding: 0 }}>
          <button className="homeButton" onClick={() => {
            this.setState({ redirectToHome: true });
          }}>
            <img alt="" src="/livepeer.png" width="100em" height="100em" />
          </button>
        </div>
        <div className="stroke" style={{ margin: 0, padding: 0 }}>
          <div className="flexContainer">
            <div className="stroke" style={{ marginTop: 0, marginBottom: 5, paddingBottom: 0 }}>
              <div className="stroke roundedOpaque" style={{}}>
                <div className="row">
                  <div className="row">
                    <img alt="" src="livepeer.png" width="30" height="30" />
                    <p>${lptPrice}</p>
                    <p>({lptPriceChange24h}%)</p>
                  </div>
                  <div className="row">
                    <h2> <a href="https://explorer.livepeer.org/accounts/0x847791cbf03be716a7fe9dc8c9affe17bd49ae5e/">Livepeer Orchestrator</a></h2>
                  </div>
                  <div className="row">
                    <img alt="" src="eth.png" width="30" height="30" />
                    <p>${ethPrice}</p>
                    <p>({ethPriceChange24h}%)</p>
                  </div>
                </div>
                <div className="stroke roundedOpaque" style={{ borderRadius: "1em", backgroundColor: "#111217" }}>
                  <div className="row" style={{paddingLeft: "1em", paddingRight: "1em"}}>
                    <Orchestrator thisOrchestrator={this.props.livepeer.thisOrchestrator} />
                  </div>
                  <div className="flexContainer" style={{ justifyContent: "center" }}>
                    <iframe className="fullGrafana" src="https://grafana.stronk.tech/d-solo/71b6OZ0Gz/orchestrator-overview?orgId=1&refresh=5s&theme=dark&panelId=23763572056" height="200" frameBorder="0"></iframe>
                  </div>
                  <div className="flexContainer" style={{ justifyContent: "center" }}>
                    <iframe className="fullGrafana" src="https://grafana.stronk.tech/d-solo/71b6OZ0Gz/orchestrator-overview?orgId=1&refresh=5s&theme=dark&panelId=23763572077" height="400" frameBorder="0"></iframe>
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
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Grafana);
