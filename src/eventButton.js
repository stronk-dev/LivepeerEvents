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
  if (obj.eventObj.eventFrom === "0x0000000000000000000000000000000000000000") {
    obj.eventObj.eventFrom = "";
  }
  if (obj.eventObj.eventTo === "0x0000000000000000000000000000000000000000") {
    obj.eventObj.eventTo = "";
  }
  if (obj.eventObj.eventTo !== "" || obj.eventObj.eventFrom !== "") {
    eventArrow = <p>→</p>;
  }
  if (obj.eventObj.eventTo) {
    eventTo = <button className="selectOrch" onClick={() => { dispatch(getOrchestratorInfo(obj.eventObj.eventTo)) }} >{obj.eventObj.eventTo}</button>
  }
  if (obj.eventObj.eventFrom) {
    eventFrom = <button className="selectOrch" onClick={() => { dispatch(getOrchestratorInfo(obj.eventObj.eventFrom)) }} >{obj.eventObj.eventFrom}</button>
  }
  if (obj.eventObj.eventCaller) {
    eventCaller =
      <button className="selectOrch" onClick={() => { dispatch(getOrchestratorInfo(obj.eventObj.eventCaller)) }} >{obj.eventObj.eventCaller}</button>
  }

  return (
    <div className="rowAlignLeft" style={{ backgroundColor: obj.eventObj.eventColour, borderRadius: "1.2em", width: 'unset' }}>
      <div className="rowAlignLeft" style={{ width: 'unset' }}>
        <a className="selectOrch"  href={obj.eventObj.transactionUrl}>
          <img alt="" src="arb.svg" width="30" height="30" />
        </a>
        <a className="selectOrch"  href={"https://explorer.livepeer.org/accounts/" + obj.eventObj.eventCaller}>
          <img alt="" src="livepeer.png" width="30" height="30" />
        </a>
        {eventCaller}
      </div>
      <div className="rowAlignLeft">
        {obj.eventObj.eventDescription}
      </div>
      <div className="row" style={{ width: 'unset'}}>
        {eventFrom}
        {eventArrow}
        {eventTo}
      </div>
    </div>
  )
}

export default EventButton;