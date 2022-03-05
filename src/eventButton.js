import React from "react";
import {
  getOrchestratorInfo
} from "./actions/livepeer";
import { useDispatch } from 'react-redux';

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
    eventArrow = <p>→</p>;
  }
  if (obj.eventObj.eventTo || obj.eventObj.eventFrom || obj.eventObj.eventCaller) {
    if (obj.eventObj.eventTo) {
      eventTo = <button className="selectOrch" onClick={() => { dispatch(getOrchestratorInfo(obj.eventObj.eventTo)) }} ><span className="elipsText">{obj.eventObj.eventTo}</span></button>
    }
    if (obj.eventObj.eventFrom) {
      eventFrom = <button className="selectOrch" onClick={() => { dispatch(getOrchestratorInfo(obj.eventObj.eventFrom)) }} ><span className="elipsText">{obj.eventObj.eventFrom}</span></button>
    }
    if (obj.eventObj.eventCaller) {
      eventCaller =
        <button className="selectOrch" onClick={() => { dispatch(getOrchestratorInfo(obj.eventObj.eventCaller)) }} ><span className="elipsText">{obj.eventObj.eventCaller}</span></button>
    }
    eventRightAddr = <div className="rowAlignRight" style={{ flex: '1', width: '100%', padding: 0, margin: 0 }}>
      {eventFrom}
      {eventArrow}
      {eventTo}
    </div>
  }
  return (
    <div className="rowAlignLeft" style={{ backgroundColor: obj.eventObj.eventColour, borderRadius: "1.2em", width: 'unset' }}>
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
  )
}

export default EventButton;