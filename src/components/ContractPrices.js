import React from "react";
import Stat from "../components/statViewer";

const ContractPrices = (obj) => {
  let ethPrice = 0;
  if (obj.quotes) {
    if (obj.quotes.ETH) {
      ethPrice = obj.quotes.ETH.price.toFixed(2);
    }
  }

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
  if (obj.blockchains) {
    l1GasFeeInGwei = obj.blockchains.l1GasFeeInGwei;
    l2GasFeeInGwei = obj.blockchains.l2GasFeeInGwei;
    redeemRewardCostL1 = obj.blockchains.redeemRewardCostL1;
    redeemRewardCostL2 = obj.blockchains.redeemRewardCostL2;
    claimTicketCostL1 = obj.blockchains.claimTicketCostL1;
    claimTicketCostL2 = obj.blockchains.claimTicketCostL2;
    withdrawFeeCostL1 = obj.blockchains.withdrawFeeCostL1;
    withdrawFeeCostL2 = obj.blockchains.withdrawFeeCostL2;
    stakeFeeCostL1 = obj.blockchains.stakeFeeCostL1;
    stakeFeeCostL2 = obj.blockchains.stakeFeeCostL2;
    commissionFeeCostL1 = obj.blockchains.commissionFeeCostL1;
    commissionFeeCostL2 = obj.blockchains.commissionFeeCostL2;
    serviceUriFeeCostL1 = obj.blockchains.serviceUriFeeCostL1;
    serviceUriFeeCostL2 = obj.blockchains.serviceUriFeeCostL2;
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

  return (
    <div className="stroke metaSidebar" style={{ padding: 0, maxWidth: "300px" }}>
      <div className="row" style={{ margin: 0, padding: 0 }}>
        <h3 style={{ margin: 0, padding: 0 }}>Smart contract prices</h3>
      </div>
      <div className="stroke" style={{ margin: 0, padding: 0 }}>
        <div className='rowAlignRight'>
          <Stat header={"Reward Call"} content1={"$" + redeemRewardCostL2USD + " ($" + redeemRewardCostL1USD + " on L1)"} />
          <Stat header={"Claim Ticket"} content1={"$" + claimTicketCostL2USD + " ($" + claimTicketCostL1USD + " on L1)"} />
        </div>
        <div className='rowAlignRight'>
          <Stat header={"Staking Fees"} content1={"$" + stakeFeeCostL2USD + " ($" + stakeFeeCostL1USD + " on L1)"} />
          <Stat header={"Set Config"} content1={"$" + commissionFeeCostL2USD + " ($" + commissionFeeCostL1USD + " on L1)"} />
        </div>
      </div>
    </div>
  )
}

export default ContractPrices;