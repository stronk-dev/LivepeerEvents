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
import EventButton from "./eventButton";

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
        lptPrice = this.props.livepeer.quotes.LPT.price;
        lptPriceChange24h = this.props.livepeer.quotes.LPT.percent_change_24h;
      }
      if (this.props.livepeer.quotes.ETH) {
        ethPrice = this.props.livepeer.quotes.ETH.price;
        ethPriceChange24h = this.props.livepeer.quotes.ETH.percent_change_24h;
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
        redeemRewardCostL1USD = redeemRewardCostL1 * ethPrice;
      }
      if (claimTicketCostL1) {
        claimTicketCostL1USD = claimTicketCostL1 * ethPrice;
      }
      if (withdrawFeeCostL1) {
        withdrawFeeCostL1USD = withdrawFeeCostL1 * ethPrice;
      }
    }
    if (l2GasFeeInGwei && ethPrice) {
      if (redeemRewardCostL2) {
        redeemRewardCostL2USD = redeemRewardCostL2 * ethPrice;
      }
      if (claimTicketCostL2) {
        claimTicketCostL2USD = claimTicketCostL2 * ethPrice;
      }
      if (withdrawFeeCostL2) {
        withdrawFeeCostL2USD = withdrawFeeCostL2 * ethPrice;
      }
    }

    let eventsList = [];
    if (this.props.livepeer.events){
      eventsList = this.props.livepeer.events;
    }

    return (
      <div className="flexContainer">
        <div className="stroke" style={{ margin: 0, padding: 0 }}>

        </div>
        <div className="stroke" style={{ margin: 0, padding: 0 }}>
          <div className="row" style={{ margin: 0, padding: 0 }}>
            <button className="homeButton" onClick={() => {
              this.setState({ redirectToHome: true });
            }}>
              <img alt="" src="livepeer.png" width="100em" height="100em" />
            </button>
          </div>
          <div className="roundedOpaque" style={{ padding: 0, width: 'unset' }}>
            {eventsList.map((eventObj, idx) => {
              console.log(eventObj);
              // TODO: make something that groups shit as long as the eventObj.transactionUrl is the same
              return <EventButton
                key={eventObj.transactionUrl+idx}
                transactionUrl={eventObj.transactionUrl}
                transactionHash={eventObj.transactionHash}
                name={eventObj.name}
                data={eventObj.data}
                address={eventObj.address}
              />
            })}
          </div>
        </div >
        <div className="stroke" style={{ padding: 0 }}>
          <div className="separator showOnlyOnMobile" />
          <div className="main-container">
            <div className="content-wrapper">
              <ScrollContainer className="overflow-container" hideScrollbars={false}>
                <div className="overflow-content roundedOpaque" style={{ cursor: 'grab' }}>
                  <h3>Price Info</h3>
                  <h4>Current LPT price: {lptPrice}</h4>
                  <h4>Current LPT price change: {lptPriceChange24h}%</h4>
                  <h4>Current ETH price: {ethPrice}</h4>
                  <h4>Current ETH price change: {ethPriceChange24h}%</h4>
                  <h3>Cost Info</h3>
                  <h5>Last updated @ {blockchainTime}</h5>
                  <h4>Current layer 1 gas fee in GWEI: {l1GasFeeInGwei}</h4>
                  <h4>Current layer 1 is at block: {l1Block}</h4>
                  <h4>Current layer 1 cost to redeem daily reward: {redeemRewardCostL1} eth = ${redeemRewardCostL1USD}</h4>
                  <h4>Current layer 1 cost to claim a winning ticket: {claimTicketCostL1} eth = ${claimTicketCostL1USD}</h4>
                  <h4>Current layer 1 cost to withdraw Eth fees: {withdrawFeeCostL1} eth = ${withdrawFeeCostL1USD}</h4>
                  <h4>Current layer 2 gas fee in GWEI: {l2GasFeeInGwei}</h4>
                  <h4>Current layer 2 is at block: {l2Block}</h4>
                  <h4>Current layer 2 cost to redeem daily reward: {redeemRewardCostL2} eth = ${redeemRewardCostL2USD}</h4>
                  <h4>Current layer 2 cost to claim a winning ticket: {claimTicketCostL2} eth = ${claimTicketCostL2USD}</h4>
                  <h4>Current layer 2 cost to withdraw Eth fees: {withdrawFeeCostL2} eth = ${withdrawFeeCostL2USD}</h4>
                </div>
              </ScrollContainer>
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
)(Livepeer);
