import React from "react";
import {
  getOrchestratorInfo
} from "./actions/livepeer";
import { useDispatch } from 'react-redux';
import Block from "./BlockViewer";

/// Displays a single event. Sets selected Orchestrator info in the redux store

const EventButton = (obj) => {
  const dispatch = useDispatch();

  let eventArrow;
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
  if (obj.eventObj.eventTo !== "" || obj.eventObj.eventFrom !== "") {
    eventArrow = <p style={{marginRight: 0}}>→</p>;
  }
  if (obj.eventObj.eventTo || obj.eventObj.eventFrom || obj.eventObj.eventCaller) {
    if (obj.eventObj.eventTo) {
      eventTo =
        <div className="rowAlignRight" style={{ width: 'unset', marginLeft: 0 }}>
          <button className="selectOrch" style={{ margin: 0, padding: '0.5em' }} onClick={() => { obj.setSearchTerm(obj.eventObj.eventTo) }} >
            <span className="elipsText">🔎</span>
          </button>
          <button className="selectOrch" style={{ margin: 0, padding: 0 }} onClick={() => { dispatch(getOrchestratorInfo(obj.eventObj.eventTo)) }} >
            <span className="elipsText">{obj.eventObj.eventTo}</span>
          </button>
        </div>
    }
    if (obj.eventObj.eventFrom) {
      eventFrom =
        <div className="rowAlignRight" style={{ width: 'unset', margin: 0 }}>
          <button className="selectOrch" style={{ margin: 0, padding: '0.5em' }} onClick={() => { obj.setSearchTerm(obj.eventObj.eventFrom) }} >
            <span className="elipsText">🔎</span>
          </button>
          <button className="selectOrch" style={{ margin: 0, padding: 0 }} onClick={() => { dispatch(getOrchestratorInfo(obj.eventObj.eventFrom)) }}>
            <span className="elipsText">{obj.eventObj.eventFrom}</span>
          </button>
        </div >
    }
    if (obj.eventObj.eventCaller) {
      eventCaller =
        <div className="rowAlignLeft" style={{ width: 'unset', margin: 0 }}>
          <button className="selectOrch" style={{ margin: 0, padding: '0.5em' }} onClick={() => { obj.setSearchTerm(obj.eventObj.eventCaller) }} >
            <span className="elipsText">🔎</span>
          </button>
          <button className="selectOrch" style={{ margin: 0, padding: 0 }} onClick={() => { dispatch(getOrchestratorInfo(obj.eventObj.eventCaller)) }} >
            <span className="elipsText">{obj.eventObj.eventCaller}</span>
          </button>
        </div>
    }
    eventRightAddr = <div className="rowAlignRight" style={{ width: 'unset', padding: 0, margin: 0 }}>
      {eventFrom}
      {eventArrow}
      {eventTo}
    </div>
  }

  let blockNumber;
  if (obj.isFirstOfBlock) {
    blockNumber = <Block block={obj.isFirstOfBlock} time={obj.time} />
  }

  return (
    <div className="stroke" style={{ width: '100%', padding: 0, margin: 0 }}>
      {blockNumber}
      <div className="rowAlignLeft" style={{ backgroundColor: obj.eventObj.eventColour, borderRadius: "1.2em", width: '100%' }}>
        <div className="rowAlignLeft" style={{ flex: '1', width: 'unset' }}>
          <a className="selectOrch" href={obj.eventObj.transactionUrl}>
            <img alt="" src="arb.svg" width="30" height="30" />
          </a>
          <a className="selectOrch" href={"https://explorer.livepeer.org/accounts/" + obj.eventObj.eventCaller}>
            <img alt="" src="livepeer.png" width="30" height="30" />
          </a>
          <div className="rowAlignLeft" style={{ flex: '1', width: '100%', padding: 0, margin: 0 }}>
            {eventCaller}
          </div>
        </div>
        <div className="rowAlignLeft" style={{ flex: '2', width: 'unset', padding: 0, margin: 0 }}>
          <span className="rowAlignLeft elipsText">
            {obj.eventObj.eventDescription}
          </span>
          {eventRightAddr}
        </div>
      </div >
    </div>
  )
}

export default EventButton;