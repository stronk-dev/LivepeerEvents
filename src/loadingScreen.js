import * as React from "react";
import { connect } from "react-redux";
import {
  getVisitorStats
} from "./actions/user";
import {
  getQuotes, getBlockchainData, getEvents, getCurrentOrchestratorInfo
} from "./actions/livepeer";
import { login } from "./actions/session";

const mapStateToProps = (state) => {
  return {
    session: state.session,
    userstate: state.userstate,
    errors: state.errors
  }
};

const mapDispatchToProps = dispatch => ({
  getVisitorStats: () => dispatch(getVisitorStats()),
  login: () => dispatch(login()),
  getQuotes: () => dispatch(getQuotes()),
  getBlockchainData: () => dispatch(getBlockchainData()),
  getEvents: () => dispatch(getEvents()),
  getCurrentOrchestratorInfo: () => dispatch(getCurrentOrchestratorInfo())
});


class Startup extends React.Component {
  componentDidMount() {
    this.props.login();
    this.props.getVisitorStats();
    this.props.getQuotes();
    this.props.getBlockchainData();
    this.props.getEvents();
    this.props.getCurrentOrchestratorInfo();
  }
  render() {
    return this.props.children;
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Startup);