import React from "react";
import Block from "./BlockViewer";
import EventButtonAddress from "./eventButtonAddress";

/// Displays a single event. Sets selected Orchestrator info in the redux store

const EventButton = (obj) => {
  let eventTo;
  let eventFrom;
  let eventCaller;
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
    blockNumber = <Block block={obj.isFirstOfBlock} time={obj.time} url={obj.eventObj.transactionUrl} />
  }

  return (
    <div className="strokeSmollLeft">
      {blockNumber}
      <div className="strokeSmollLeft" style={{ borderRadius: "1.2em", backgroundColor: obj.eventObj.eventColour, opacity: 0.9, border: '0.1em solid rgba(54, 46, 46, 0.1)', boxShadow: "4px 2px 3px 2px rgba(54, 46, 46, 0.1)" }}>
        <div className="halfVerticalDivider" />
        <div className="rowAlignLeft">
          {eventCaller}
        </div>
        <div className="halfVerticalDivider" />
        <div className="row">
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'stretch', maxWidth: '61.8%', textAlign: 'justify', padding: '0.5em', backgroundColor: obj.eventObj.eventColour, border: '0.1em solid rgba(54, 46, 46, 0.1)' }}>
            {obj.eventObj.eventDescription}
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