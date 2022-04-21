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
    eventCaller = obj.eventObj.address;
    eventDescription = <Ticket seed={obj.seed + "-desc-"} icon={"💸"} subtext={"called reward"} descriptions={[
      "+" + obj.eventObj.amount.toFixed(2) + " LPT" + (Math.floor(obj.eventObj.amount) == 69 ? "... Nice!" : "")
    ]} />
    eventColour = rewardColour;
  } else if (obj.type == "claim") {
    eventCaller = obj.eventObj.address;
    eventDescription = <Ticket seed={obj.seed + "-desc-"} icon={"💰"} subtext={"delegator claimed"} descriptions={[
      (eventObj.data.endRound - eventObj.data.startRound + 1) + " rounds",
      "+" + obj.eventObj.rewards.toFixed(2) + " LPT rewards",
      "+" + obj.eventObj.fees.toFixed(4) + " Eth fees"
    ]} />
    eventColour = claimColour;
  } else if (obj.type == "withdrawStake") {
    eventCaller = obj.eventObj.address;
    eventDescription = <Ticket seed={obj.seed + "-desc-"} icon={"🏦"} subtext={"withdrew stake"} descriptions={[
      (eventObj.endRound - eventObj.startRound + 1) + " rounds",
      "+" + obj.eventObj.rewards.toFixed(2) + " LPT rewards",
      "+" + obj.eventObj.fees.toFixed(4) + " Eth fees"
    ]} />
    eventColour = withdrawStakeColour;
  } else if (obj.type == "withdrawFees") {
    eventCaller = obj.eventObj.address;
    eventDescription = <Ticket seed={obj.seed + "-desc-"} icon={"🏦"} subtext={"withdrew fees"} descriptions={[
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
    eventCaller = obj.eventObj.address;
    eventDescription = <Ticket seed={obj.seed + "-desc-"} icon={"🎟️"} subtext={"redeemed winning ticket"} descriptions={[
      "+" + obj.eventObj.amount.toFixed(4) + " Eth"
    ]} />
    eventColour = ticketRedeemColour;
  } else if (obj.type == "stake") {
    eventCaller = obj.eventObj.address;
    eventFrom = obj.eventObj.from;
    eventTo = obj.eventObj.to;
    if (eventFrom === "0x0000000000000000000000000000000000000000") {
      eventFrom = "";
      eventDescription = <Ticket seed={currentTx + "-" + txCounter} icon={"⌛"} subtext={"is now staking"} descriptions={[
        obj.eventObj.stake.toFixed(2) + " LPT"
      ]} />
    } else if (eventFrom === eventTo) {
      eventFrom = "";
      eventDescription = <Ticket seed={currentTx + "-" + txCounter} icon={"⌛"} subtext={"changed stake"} descriptions={[
        obj.eventObj.stake.toFixed(2) + " LPT"
      ]} />
    } else {
      eventDescription = <Ticket seed={currentTx + "-" + txCounter} icon={"⌛"} subtext={"moved stake"} descriptions={[
        obj.eventObj.stake.toFixed(2) + " LPT"
      ]} />
    }
    eventColour = stakeColour;
  }

  if (obj.eventObj.eventFrom === "0x0000000000000000000000000000000000000000") {
    obj.eventObj.eventFrom = "";
  }
  if (obj.eventObj.eventTo === "0x0000000000000000000000000000000000000000") {
    obj.eventObj.eventTo = "";
  }
  if (obj.eventObj.eventTo || obj.eventObj.eventFrom || obj.eventObj.eventCaller) {
    if (obj.eventObj.eventTo) {
      eventTo =
        <EventButtonAddress name="To&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;" address={obj.eventObj.eventTo} setSearchTerm={obj.setSearchTerm} />
    }
    if (obj.eventObj.eventFrom) {
      eventFrom =
        <EventButtonAddress name="From&nbsp;&nbsp;:&nbsp;" address={obj.eventObj.eventFrom} setSearchTerm={obj.setSearchTerm} />
    }
    if (obj.eventObj.eventCaller) {
      eventCaller =
        <EventButtonAddress name="Caller&nbsp;:&nbsp;" address={obj.eventObj.eventCaller} setSearchTerm={obj.setSearchTerm} />
    }
  }

  let blockNumber;
  if (obj.isFirstOfBlock) {
    blockNumber = <Block block={obj.isFirstOfBlock} time={obj.time} url={"https://arbiscan.io/tx/" + obj.eventObj.transactionHash} />
  }

  return (
    <div className="strokeSmollLeft" style={{ width: '100%', minWidth: '200px', maxWidth: '500px' }}>
      {blockNumber}
      <div className="strokeSmollLeft" style={{ width: "100%", borderRadius: "1.2em", backgroundColor: eventColour, opacity: 0.9, border: '0.1em solid rgba(54, 46, 46, 0.1)', boxShadow: "4px 2px 3px 2px rgba(54, 46, 46, 0.1)" }}>
        <div className="halfVerticalDivider" />
        <div className="rowAlignLeft">
          {eventCaller}
        </div>
        <div className="halfVerticalDivider" />
        <div className="row">
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'stretch', maxWidth: '61.8%', textAlign: 'justify', padding: '0.5em', backgroundColor: eventColour, border: '0.1em solid rgba(54, 46, 46, 0.1)' }}>
            {eventDescription}
          </div>
        </div>
        <div className="halfVerticalDivider" />
        <div className="rowAlignLeft">
          {eventFrom}
        </div>
        <div className="rowAlignLeft">
          {eventTo}
        </div>
        <div className="halfVerticalDivider" />
      </div>
      <div className="halfVerticalDivider" />
    </div>
  )
}

export default EventButton;