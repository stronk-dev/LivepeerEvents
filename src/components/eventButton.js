import React from "react";
import {
  getOrchestratorInfo
} from "../actions/livepeer";
import { useDispatch } from 'react-redux';
import Block from "./BlockViewer";

/// Displays a single event. Sets selected Orchestrator info in the redux store

const EventButton = (obj) => {
  const dispatch = useDispatch();


  let eventTo;
  let eventFrom;
  let eventCaller;
  let eventRightAddr;
  if (obj.eventObj.eventFrom === "0x0000000000000000000000000000000000000000") {
    obj.eventObj.eventFrom = "";
  }
  if (obj.eventObj.eventTo === "0x0000000000000000000000000000000000000000") {
    obj.eventObj.eventTo = "";
  }
  if (obj.eventObj.eventTo || obj.eventObj.eventFrom || obj.eventObj.eventCaller) {
    if (obj.eventObj.eventTo) {
      eventTo =
        <div className="rowAlignLeft" style={{ width: '100%', margin: 0 }}>
          <a className="selectOrch" style={{ cursor: 'alias' }} rel="noopener noreferrer" target="_blank" href={"https://explorer.livepeer.org/accounts/" + obj.eventObj.eventTo}>
            <img alt="" src="livepeer.png" width="20em" height="20em" style={{ margin: 0 }} />
          </a>
          <button className="selectOrch" style={{ margin: 0, padding: '0.5em', cursor: 'pointer' }} onClick={() => { obj.setSearchTerm(obj.eventObj.eventTo) }} >
            <span className="elipsText">🔎</span>
          </button>
          <span>To&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;</span>
          <button className="selectOrch" style={{ margin: 0, padding: '0.5em', cursor: 'help' }} onClick={() => { dispatch(getOrchestratorInfo(obj.eventObj.eventTo)) }} >
            <span className="elipsText elipsOnMobileExtra">{obj.eventObj.eventTo}</span>
          </button>
        </div>
    }
    if (obj.eventObj.eventFrom) {
      eventFrom =
        <div className="rowAlignLeft" style={{ width: '100%', margin: 0 }}>
          <a className="selectOrch" style={{ cursor: 'alias' }} rel="noopener noreferrer" target="_blank" href={"https://explorer.livepeer.org/accounts/" + obj.eventObj.eventFrom}>
            <img alt="" src="livepeer.png" width="20em" height="20em" style={{ margin: 0 }} />
          </a>
          <button className="selectOrch" style={{ margin: 0, padding: '0.5em', cursor: 'pointer' }} onClick={() => { obj.setSearchTerm(obj.eventObj.eventFrom) }} >
            <span className="elipsText">🔎</span>
          </button>
          <span>From&nbsp;&nbsp;:&nbsp;</span>
          <button className="selectOrch" style={{ margin: 0, padding: '0.5em', cursor: 'help' }} onClick={() => { dispatch(getOrchestratorInfo(obj.eventObj.eventFrom)) }}>
            <span className="elipsText elipsOnMobileExtra">{obj.eventObj.eventFrom}</span>
          </button>
        </div >
    }
    if (obj.eventObj.eventCaller) {
      eventCaller =
        <div className="rowAlignLeft" style={{ width: '100%', margin: 0 }}>
          <a className="selectOrch" style={{ cursor: 'alias' }} rel="noopener noreferrer" target="_blank" href={"https://explorer.livepeer.org/accounts/" + obj.eventObj.eventCaller}>
            <img alt="" src="livepeer.png" width="20em" height="20em" style={{ margin: 0 }} />
          </a>
          <button className="selectOrch" style={{ margin: 0, padding: '0.5em', cursor: 'pointer' }} onClick={() => { obj.setSearchTerm(obj.eventObj.eventCaller) }} >
            <span className="elipsText">🔎</span>
          </button>
          <span>Caller&nbsp;:&nbsp;</span>
          <button className="selectOrch" style={{ margin: 0, padding: '0.5em', cursor: 'help' }} onClick={() => { dispatch(getOrchestratorInfo(obj.eventObj.eventCaller)) }} >
            <span className="elipsText elipsOnMobileExtra">{obj.eventObj.eventCaller}</span>
          </button>
        </div>
    }
    eventRightAddr = <div className="strokeSmollLeft" style={{ width: 'unset', padding: 0, margin: 0 }}>

    </div>
  }

  let blockNumber;
  if (obj.isFirstOfBlock) {
    blockNumber = <Block block={obj.isFirstOfBlock} time={obj.time} url={obj.eventObj.transactionUrl} />
  }

  return (
    <div className="stroke" style={{ width: '100%', padding: '0', margin: 0, marginBottom: '1.0em' }}>
      {blockNumber}
      <div className="strokeSmollLeft" style={{ borderRadius: "1.2em", backgroundColor: obj.eventObj.eventColour, boxShadow: "5px 8px 5px 4px  " + obj.eventObj.eventColour, padding: '0', margin: 0, width: '100%' }}>
        <div className="rowAlignLeft" style={{ marginTop: '0.5em' }}>
          {eventCaller}
        </div>
        <div className="row">
          <div className="row" style={{ maxWidth: '61.8%', textAlign: 'justify', padding: '0.5em', border: '0.1em solid rgba(54, 46, 46, 0.1)', boxShadow: "4px 2px 3px 2px rgba(54, 46, 46, 0.1)" }}>
            {obj.eventObj.eventDescription}
          </div>
        </div>
        <div className="rowAlignLeft">
          {eventFrom}
        </div>
        <div className="rowAlignLeft">
          {eventTo}
        </div>
      </div>
    </div>
  )
}

export default EventButton;