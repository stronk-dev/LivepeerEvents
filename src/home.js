import * as React from "react";
import './style.css';
import {
  Navigate
} from "react-router-dom";
import { connect } from "react-redux";
import {
  getVisitorStats
} from "./actions/user";

const mapStateToProps = (state) => {
  return {
    session: state.session,
    userstate: state.userstate,
    errors: state.errors
  }
};

const mapDispatchToProps = dispatch => ({
  getVisitorStats: () => dispatch(getVisitorStats())
});


class Home extends React.Component {
  state = {
    redirectToGrafana: false,
    redirectToLPT: false
  };

  constructor(props) {
    super(props);
  }

  render() {
    if (this.state.redirectToGrafana) {
      return <Navigate push to="/orchestrator" />;
    }
    if (this.state.redirectToLPT) {
      return <Navigate push to="/livepeer" />;
    }

    var totalVisitorCount = 0;
    var activeVisitorCount = 0;
    if (this.props.userstate.visitorStats) {
      totalVisitorCount = this.props.userstate.visitorStats.totalVisitorCount;
      activeVisitorCount = this.props.userstate.visitorStats.activeVisitorCount
    }

    return (
      <div className="stroke" style={{ padding: 0 }}>
        <div className="row" style={{ margin: 0, padding: 0 }}>
          <img alt="" src="livepeer.png" width="100em" height="100em" style={{ zIndex: 10 }} />
        </div>
        <div className="flexContainer">
          <div className="stroke roundedOpaque">
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
                this.setState({ redirectToGrafana: true });
              }}>
                <p>🚀 Orchestrator 🌑</p>
              </button>
            </div>
            <div className="row">
              <button className="waveButton" onClick={() => {
                this.setState({ redirectToLPT: true });
              }}>
                <p>🔎 Blockchain 🕵️</p>
              </button>
            </div>
          </div>
        </div>
        <div className="alwaysOnBottom showNeverOnMobile" style={{ margin: 0, padding: 0 }}>
          <div className="row" style={{ margin: 0, padding: 0 }}>
            <h4 className="lightText" style={{ margin: 0, padding: 0 }}>
              Connected as {this.props.session.ip || "?"}
            </h4>
          </div>
          <div className="row" style={{ margin: 0, padding: 0 }}>
            <h3 className="lightText" style={{ margin: 0, padding: 0 }}>
              {totalVisitorCount} unique visitors / {activeVisitorCount} of which have interacted with this website
            </h3>
          </div>
        </div>
        <div className="alwaysOnBottomRight" style={{ margin: 0, padding: 0 }}>
          <h6 className="lightText" style={{ margin: 0, padding: 0 }}>
            nframe.nl
          </h6>
        </div>
      </div>
    )
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Home);
