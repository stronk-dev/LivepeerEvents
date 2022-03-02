import * as React from "react";
import './style.css';
import {
  Navigate
} from "react-router-dom";
import ScrollContainer from 'react-indiana-drag-scroll';
import { connect } from "react-redux";
import {
  getQuotes, getBlockchainData, getEvents
} from "./actions/livepeer";
import EventViewer from "./eventViewer";

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
  getEvents: () => dispatch(getEvents())
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
    }

    let redeemRewardCostL1USD;
    let redeemRewardCostL2USD;
    let claimTicketCostL1USD;
    let claimTicketCostL2USD;
    let withdrawFeeCostL1USD;
    let withdrawFeeCostL2USD;
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
    }

    let eventsList = [];
    if (this.props.livepeer.events) {
      eventsList = this.props.livepeer.events;
    }

    return (
      <div className="rowContainer">
        <div className="row" style={{ margin: 0, padding: 0, backgroundColor: "rgba(180, 175, 252, 0.80)", boxSizing: "border-box", backdropDilter: "blur(6px)", boxSshadow: "9px 13px 18px 8px  rgba(8, 7, 56, 0.692)" }}>
          <div className="stroke" style={{ margin: 0, padding: 0 }}>
            <div className="row" style={{ margin: 0, padding: 0 }}>
              <button className="homeButton" onClick={() => {
                this.setState({ redirectToHome: true });
              }}>
                <img alt="" src="livepeer.png" width="100em" height="100em" />
              </button>
            </div>
          </div >
          <div className="stroke" style={{ padding: 0 }}>
            <div className="main-container">
              <div className="content-wrapper">
                <ScrollContainer className="overflow-container" hideScrollbars={false}>
                  <div className="overflow-content metaSidebar" style={{ cursor: 'grab' }}>
                    <div className="stroke" style={{ margin: 0, padding: 0 }}>
                      <div className="row">
                        <h3>Price Info</h3>
                      </div>
                      <div className="row">
                        <img alt="" src="livepeer.png" width="30" height="30" />
                        <p>${lptPrice}</p>
                        <p>({lptPriceChange24h}%)</p>
                      </div>
                      <div className="row">
                        <img alt="" src="eth.png" width="30" height="30" />
                        <p>${ethPrice}</p>
                        <p>({ethPriceChange24h}%)</p>
                      </div>
                    </div>
                    <div className="stroke" style={{ margin: 0, padding: 0 }}>
                      <h3>Smart contract prices L2</h3>
                      <div className="row">
                        <p>Reward Call:</p>
                        <p>${redeemRewardCostL2USD}</p>
                      </div>
                      <div className="row">
                        <p>Claim Ticket:</p>
                        <p>${claimTicketCostL2USD}</p>
                      </div>
                      <div className="row">
                        <p>Withdraw Fees:</p>
                        <p>${withdrawFeeCostL2USD}</p>
                      </div>
                    </div>
                    <div className="stroke" style={{ margin: 0, padding: 0 }}>
                      <h3>Smart contract prices L1</h3>
                      <div className="row">
                        <p>Reward Call:</p>
                        <p>${redeemRewardCostL1USD}</p>
                      </div>
                      <div className="row">
                        <p>Claim Ticket:</p>
                        <p>${claimTicketCostL1USD}</p>
                      </div>
                      <div className="row">
                        <p>Withdraw Fees:</p>
                        <p>${withdrawFeeCostL1USD}</p>
                      </div>
                    </div>
                  </div>
                </ScrollContainer>
              </div>
            </div>
          </div>
        </div>
        <div className="stroke" style={{ margin: 0, padding: 0 }}>
          <div className="stroke" style={{ margin: 0, padding: 0 }}>

          </div>
          <div className="stroke" style={{ margin: 0, padding: 0 }}>
            <EventViewer events={eventsList} />
          </div >
          <div className="stroke" style={{ padding: 0 }}>

          </div>
        </div>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Livepeer);
