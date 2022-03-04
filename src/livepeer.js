import * as React from "react";
import './style.css';
import {
  Navigate
} from "react-router-dom";
import { connect } from "react-redux";
import {
  getQuotes, getBlockchainData, getEvents, getCurrentOrchestratorInfo, getOrchestratorInfo
} from "./actions/livepeer";
import EventViewer from "./eventViewer";
import Orchestrator from "./orchestratorViewer";
import Stat from "./statViewer";

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
  getBlockchainData: () => dispatch(getBlockchainData()),
  getEvents: () => dispatch(getEvents()),
  getCurrentOrchestratorInfo: () => dispatch(getCurrentOrchestratorInfo()),
  getOrchestratorInfo: (addr) => dispatch(getOrchestratorInfo(addr))
});

class Livepeer extends React.Component {
  state = {
    redirectToHome: false,
  };

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.getQuotes();
    this.props.getBlockchainData();
    this.props.getEvents();
    this.props.getCurrentOrchestratorInfo();
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

    let blockchainTime = 0;
    let l1Block = 0;
    let l2Block = 0;
    let l1GasFeeInGwei = 0;
    let l2GasFeeInGwei = 0;
    let redeemRewardCostL1 = 0;
    let redeemRewardCostL2 = 0;
    let claimTicketCostL1 = 0;
    let claimTicketCostL2 = 0;
    let withdrawFeeCostL1 = 0;
    let withdrawFeeCostL2 = 0;
    let stakeFeeCostL1 = 0;
    let stakeFeeCostL2 = 0;
    let commissionFeeCostL1 = 0;
    let commissionFeeCostL2 = 0;
    let serviceUriFeeCostL1 = 0;
    let serviceUriFeeCostL2 = 0;
    if (this.props.livepeer.blockchains) {
      blockchainTime = this.props.livepeer.blockchains.timestamp;
      l1GasFeeInGwei = this.props.livepeer.blockchains.l1GasFeeInGwei;
      l2GasFeeInGwei = this.props.livepeer.blockchains.l2GasFeeInGwei;
      redeemRewardCostL1 = this.props.livepeer.blockchains.redeemRewardCostL1;
      redeemRewardCostL2 = this.props.livepeer.blockchains.redeemRewardCostL2;
      claimTicketCostL1 = this.props.livepeer.blockchains.claimTicketCostL1;
      claimTicketCostL2 = this.props.livepeer.blockchains.claimTicketCostL2;
      withdrawFeeCostL1 = this.props.livepeer.blockchains.withdrawFeeCostL1;
      withdrawFeeCostL2 = this.props.livepeer.blockchains.withdrawFeeCostL2;
      l1Block = this.props.livepeer.blockchains.l1block;
      l2Block = this.props.livepeer.blockchains.l2block;
      stakeFeeCostL1 = this.props.livepeer.blockchains.stakeFeeCostL1;
      stakeFeeCostL2 = this.props.livepeer.blockchains.stakeFeeCostL2;
      commissionFeeCostL1 = this.props.livepeer.blockchains.commissionFeeCostL1;
      commissionFeeCostL2 = this.props.livepeer.blockchains.commissionFeeCostL2;
      serviceUriFeeCostL1 = this.props.livepeer.blockchains.serviceUriFeeCostL1;
      serviceUriFeeCostL2 = this.props.livepeer.blockchains.serviceUriFeeCostL2;
    }

    let redeemRewardCostL1USD = 0;
    let redeemRewardCostL2USD = 0;
    let claimTicketCostL1USD = 0;
    let claimTicketCostL2USD = 0;
    let withdrawFeeCostL1USD = 0;
    let withdrawFeeCostL2USD = 0;
    let stakeFeeCostL1USD = 0;
    let stakeFeeCostL2USD = 0;
    let commissionFeeCostL1USD = 0;
    let commissionFeeCostL2USD = 0;
    let serviceUriFeeCostL1USD = 0;
    let serviceUriFeeCostL2USD = 0;
    if (l1GasFeeInGwei && ethPrice) {
      if (redeemRewardCostL1) {
        redeemRewardCostL1USD = (redeemRewardCostL1 * ethPrice).toFixed(2);
      }
      if (claimTicketCostL1) {
        claimTicketCostL1USD = (claimTicketCostL1 * ethPrice).toFixed(2);
      }
      if (withdrawFeeCostL1) {
        withdrawFeeCostL1USD = (withdrawFeeCostL1 * ethPrice).toFixed(2);
      }
      if (stakeFeeCostL1) {
        stakeFeeCostL1USD = (stakeFeeCostL1 * ethPrice).toFixed(2);
      }
      if (commissionFeeCostL1) {
        commissionFeeCostL1USD = (commissionFeeCostL1 * ethPrice).toFixed(2);
      }
      if (serviceUriFeeCostL1) {
        serviceUriFeeCostL1USD = (serviceUriFeeCostL1 * ethPrice).toFixed(2);
      }
    }
    if (l2GasFeeInGwei && ethPrice) {
      if (redeemRewardCostL2) {
        redeemRewardCostL2USD = (redeemRewardCostL2 * ethPrice).toFixed(2);
      }
      if (claimTicketCostL2) {
        claimTicketCostL2USD = (claimTicketCostL2 * ethPrice).toFixed(2);
      }
      if (withdrawFeeCostL2) {
        withdrawFeeCostL2USD = (withdrawFeeCostL2 * ethPrice).toFixed(2);
      }
      if (stakeFeeCostL2) {
        stakeFeeCostL2USD = (stakeFeeCostL2 * ethPrice).toFixed(2);
      }
      if (commissionFeeCostL2) {
        commissionFeeCostL2USD = (commissionFeeCostL2 * ethPrice).toFixed(2);
      }
      if (serviceUriFeeCostL2) {
        serviceUriFeeCostL2USD = (serviceUriFeeCostL2 * ethPrice).toFixed(2);
      }
    }

    let eventsList = [];
    if (this.props.livepeer.events) {
      eventsList = this.props.livepeer.events;
    }

    let thisOrchObj;
    if (this.props.livepeer.selectedOrchestrator) {
      thisOrchObj = this.props.livepeer.selectedOrchestrator;
    }

    return (
      <div style={{ width: '100%', height: '100%' }}>
        <div className="row" style={{ margin: 0, padding: 0, backgroundColor: "rgba(180, 175, 252, 0.80)", boxSizing: "border-box", backdropDilter: "blur(6px)", boxSshadow: "9px 13px 18px 8px  rgba(8, 7, 56, 0.692)", position: 'absolute', top: '0px', left: '0px', height: '300px', right: '0px', overflow: 'hidden' }}>
          <button className="homeButton" onClick={() => {
            this.setState({ redirectToHome: true });
          }}>
            <img alt="" src="livepeer.png" width="100em" height="100em" />
          </button>
          <div className="row" style={{ alignItems: 'stretch', height: '100%', flex: 2, padding: '1em' }}>
            <Orchestrator thisOrchestrator={thisOrchObj} />
          </div>
          <div className="stroke metaSidebar" style={{ padding: 0, flex: 1 }}>
            <div className="row" style={{ margin: 0, padding: 0 }}>
              <h3 style={{ margin: 0, padding: 0 }}>Smart contract prices</h3>
            </div>
            <div className="stroke" style={{ margin: 0, padding: 0 }}>
              <Stat header={"Reward Call"} content={"$" + redeemRewardCostL2USD + " (vs " + redeemRewardCostL1USD + " on L1)"} />
              <Stat header={"Claim Ticket"} content={"$" + claimTicketCostL2USD + " (vs " + claimTicketCostL1USD + " on L1)"} />
              <Stat header={"Staking Fees"} content={"$" + stakeFeeCostL2USD + " (vs " + stakeFeeCostL1USD + " on L1)"} />
              <Stat header={"Change Commission"} content={"$" + commissionFeeCostL2USD + " (vs " + commissionFeeCostL1USD + " on L1)"} />
              <Stat header={"Change URI"} content={"$" + serviceUriFeeCostL2USD + " (vs " + serviceUriFeeCostL1USD + " on L1)"} />
            </div>
          </div>
        </div >
        <EventViewer events={eventsList} setOrchFunction={this.props.getOrchestratorInfo} />
      </div >
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Livepeer);
