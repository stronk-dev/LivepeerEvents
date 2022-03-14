import React from "react";
import {
  getOrchestratorInfo
} from "../actions/livepeer";
import { useDispatch } from 'react-redux';

const EventButtonAddress = (obj) => {
  const dispatch = useDispatch();

  return (
    <div className="rowAlignLeft" style={{ width: '100%' }}>
      <a className="selectOrch" style={{ cursor: 'alias' }} rel="noopener noreferrer" target="_blank" href={"https://explorer.livepeer.org/accounts/" + obj.address}>
        <img alt="" src="livepeer.png" width="20em" height="20em" style={{ margin: 0 }} />
      </a>
      <button className="selectOrch" style={{ padding: '0.5em', cursor: 'pointer' }} onClick={() => { obj.setSearchTerm(obj.address) }} >
        <span className="elipsText">🔎</span>
      </button>
      <span>{obj.name}</span>
      <button className="selectOrch" style={{ padding: '0.5em', cursor: 'help' }} onClick={() => { dispatch(getOrchestratorInfo(obj.address)) }} >
        <span className="elipsText elipsOnMobileExtra">{obj.address}</span>
      </button>
    </div>
  )
}

export default EventButtonAddress;