import React from "react";
import Block from "./BlockViewer";
import EventButtonAddress from "./eventButtonAddress";
import Ticket from "../components/TicketViewer";

const claimColour = "rgba(25, 158, 29, 0.4)";
const stakeColour = "rgba(25, 158, 147, 0.4)";
const ticketRedeemColour = "rgba(25, 98, 158, 0.4)";
const rewardColour = "rgba(25, 27, 158, 0.4)";
const unbondColour = "rgba(105, 25, 158, 0.4)";
const updateColour = "rgba(158, 25, 52, 0.4)";
const withdrawStakeColour = "rgba(158, 98, 25, 0.4)";
const activationColour = "rgba(154, 158, 25, 0.4)";
const ticketTransferColour = "rgba(88, 91, 42, 0.3)";
const greyColour = "rgba(122, 128, 127, 0.4)";

/// Displays a single event. Sets selected Orchestrator info in the redux store

const EventButton = (obj) => {
  let eventTo = "";
  let eventFrom = "";
  let eventCaller = "";
  let eventDescription = "";
  let eventColour = greyColour;

  if (obj.type == "update") {
    eventCaller = obj.eventObj.address;
    eventDescription = <Ticket seed={obj.seed + "-desc-"} icon={"🔄"} subtext={"changed commission"} descriptions={[
      obj.eventObj.rewardCommission.toFixed(2) + "% on staking rewards",
      obj.eventObj.feeCommission.toFixed(2) + "% on transcoding fees"
    ]} />
    eventColour = updateColour;
  } else if (obj.type == "reward") {
    // Determine reward cut
    let appendix = "";
    if (obj.monthlyStats) {
      var dateObj = new Date(0);
      dateObj.setUTCSeconds(obj.time);
      const thisYear = dateObj.getFullYear();
      const thisMonth = dateObj.getMonth();
      for (const timeObj of obj.monthlyStats) {
        if (thisYear == timeObj.year && thisMonth == timeObj.month) {
          if (timeObj.latestCommission) {
            for (const commissionObj of timeObj.latestCommission) {
              if (commissionObj.address == obj.eventObj.address) {
                appendix += ", keeping " + (obj.eventObj.amount * (commissionObj.rewardCommission / 100)).toFixed(4) + " LPT as commission";
              }
            }
          }
        }
      }
    }
    eventCaller = obj.eventObj.address;
    eventDescription = <Ticket seed={obj.seed + "-desc-"} icon={"🏦"} subtext={"called reward"} descriptions={[
      "+" + obj.eventObj.amount.toFixed(2) + " LPT" + appendix
    ]} />
    eventColour = rewardColour;
  } else if (obj.type == "claim") {
    eventCaller = obj.eventObj.address;
    eventDescription = <Ticket seed={obj.seed + "-desc-"} icon={"💰"} subtext={"delegator claimed"} descriptions={[
      (obj.eventObj.endRound - obj.eventObj.startRound + 1) + " rounds",
      "+" + obj.eventObj.rewards.toFixed(2) + " LPT rewards",
      "+" + obj.eventObj.fees.toFixed(4) + " Eth fees"
    ]} />
    eventColour = claimColour;
  } else if (obj.type == "withdrawStake") {
    eventCaller = obj.eventObj.address;
    eventDescription = <Ticket seed={obj.seed + "-desc-"} icon={"💸"} subtext={"withdrew stake"} descriptions={[
      obj.eventObj.amount.toFixed(2) + " LPT",
      "round " + obj.eventObj.round
    ]} />
    eventColour = withdrawStakeColour;
  } else if (obj.type == "withdrawFees") {
    eventCaller = obj.eventObj.address;
    eventDescription = <Ticket seed={obj.seed + "-desc-"} icon={"💸"} subtext={"withdrew fees"} descriptions={[
      "+" + obj.eventObj.amount.toFixed(4) + " Eth fees"
    ]} />
    eventColour = withdrawStakeColour;
  } else if (obj.type == "activate") {
    eventCaller = obj.eventObj.address;
    if (obj.eventObj.initialStake) {
      eventDescription = <Ticket seed={obj.seed + "-desc-"} icon={"🚀"} subtext={"activated"} descriptions={[
        obj.eventObj.initialStake.toFixed(2) + " LPT stake",
        "round " + obj.eventObj.round
      ]} />
    } else {
      eventDescription = <Ticket seed={obj.seed + "-desc-"} icon={"🚀"} subtext={"reactivated"} descriptions={[
        "round " + obj.eventObj.round
      ]} />
    }
    eventColour = activationColour;
  } else if (obj.type == "unbond") {
    eventCaller = obj.eventObj.address;
    eventFrom = obj.eventObj.from;
    eventDescription = <Ticket seed={obj.seed + "-desc-"} icon={"❌"} subtext={"unbond"} descriptions={[
      obj.eventObj.stake.toFixed(2) + " LPT",
      "round " + obj.eventObj.round
    ]} />
    eventColour = unbondColour;
  } else if (obj.type == "transferTicket") {
    eventCaller = obj.eventObj.address;
    eventTo = obj.eventObj.to;
    eventDescription = <Ticket seed={obj.seed + "-desc-"} icon={"🎟️"} subtext={"sent winning ticket"} descriptions={[
      "+" + obj.eventObj.amount.toFixed(4) + " Eth"
    ]} />
    eventColour = ticketTransferColour;
  } else if (obj.type == "redeemTicket") {
    // Determine fee cut
    let appendix = "";
    if (obj.monthlyStats) {
      var dateObj = new Date(0);
      dateObj.setUTCSeconds(obj.time);
      const thisYear = dateObj.getFullYear();
      const thisMonth = dateObj.getMonth();
      for (const timeObj of obj.monthlyStats) {
        if (thisYear == timeObj.year && thisMonth == timeObj.month) {
          if (timeObj.latestCommission) {
            for (const commissionObj of timeObj.latestCommission) {
              if (commissionObj.address == obj.eventObj.address) {
                appendix += ", keeping " + (obj.eventObj.amount * (commissionObj.feeCommission / 100)).toFixed(4) + " Eth as commission";
              }
            }
          }
        }
      }
    }
    eventCaller = obj.eventObj.address;
    eventDescription = <Ticket seed={obj.seed + "-desc-"} icon={"🎟️"} subtext={"redeemed winning ticket"} descriptions={[
      "+" + obj.eventObj.amount.toFixed(4) + " Eth" + appendix
    ]} />
    eventColour = ticketRedeemColour;
  } else if (obj.type == "stake") {
    eventCaller = obj.eventObj.address;
    eventFrom = obj.eventObj.from;
    eventTo = obj.eventObj.to;
    if (eventFrom === "0x0000000000000000000000000000000000000000") {
      eventFrom = "";
      eventDescription = <Ticket seed={obj.seed + "-desc-"} icon={"⌛"} subtext={"is now staking"} descriptions={[
        obj.eventObj.stake.toFixed(2) + " LPT"
      ]} />
    } else if (eventFrom === eventTo) {
      eventFrom = "";
      eventDescription = <Ticket seed={obj.seed + "-desc-"} icon={"⌛"} subtext={"changed stake"} descriptions={[
        obj.eventObj.stake.toFixed(2) + " LPT"
      ]} />
    } else {
      eventDescription = <Ticket seed={obj.seed + "-desc-"} icon={"⌛"} subtext={"moved stake"} descriptions={[
        obj.eventObj.stake.toFixed(2) + " LPT"
      ]} />
    }
    eventColour = stakeColour;
  }

  if (eventFrom === "0x0000000000000000000000000000000000000000") {
    eventFrom = "";
  }
  if (eventTo === "0x0000000000000000000000000000000000000000") {
    eventTo = "";
  }
  if (eventTo || eventFrom || eventCaller) {
    if (eventTo) {
      eventTo =
        <EventButtonAddress name="To" address={eventTo} setSearchTerm={obj.setSearchTerm} />
    }
    if (eventFrom) {
      eventFrom =
        <EventButtonAddress name="From" address={eventFrom} setSearchTerm={obj.setSearchTerm} />
    }
    if (eventCaller) {
      eventCaller =
        <EventButtonAddress name="" address={eventCaller} setSearchTerm={obj.setSearchTerm} />
    }
  }

  let blockNumber;
  if (obj.isFirstOfBlock) {
    blockNumber = <Block block={obj.isFirstOfBlock} time={obj.time} url={"https://arbiscan.io/tx/" + obj.eventObj.transactionHash} />
  }

  return (
    <div className="strokeSmollLeft" style={{ width: '100%', margin: 0, padding: 0 }}>
      <div className="row" style={{ paddingLeft: '1em', paddingRight: '1em' }}>
        {blockNumber}
      </div>
      <div className="row" style={{ margin: 0, padding: 0 }}>
        <div className="stroke infoContainer" style={{ width: "100%", padding: 0, margin: 0, minWidth: '200px', maxWidth: '400px' }}>
          <div className="rowAlignLeft infoBar" style={{ margin: 0 }}>
            {eventCaller}
          </div>
          <div className="halfVerticalDivider" />
          <div className="row">
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'stretch', maxWidth: '61.8%', textAlign: 'justify', padding: '0.5em', backgroundColor: eventColour, border: '0.1em solid rgba(54, 46, 46, 0.1)' }}>
              {eventDescription}
            </div>
          </div>
          <div className="halfVerticalDivider" />
          <div className="stroke infoBar">
            <div className="rowAlignLeft" style={{ margin: 0 }}>
              {eventFrom}
            </div>
            <div className="rowAlignLeft" style={{ margin: 0 }}>
              {eventTo}
            </div>
          </div>
        </div>
      </div>
      <div className="halfVerticalDivider" />
    </div>
  )
}

export default EventButton;