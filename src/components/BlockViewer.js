import React, { useEffect, useState } from "react";
import {
  getRoundAtBlock
} from "../actions/livepeer";
import { useDispatch, useSelector } from 'react-redux';

const Block = (obj) => {
  const dispatch = useDispatch();
  const livepeer = useSelector((state) => state.livepeerstate);
  const [roundInfo, setRoundInfo] = useState(null);
  const [hasRefreshed, setRefresh] = useState(false);

  // useEffect(() => {
  //   let thisInfo = null;
  //   for (const round of livepeer.rounds) {
  //     if (round.startBlock <= obj.block && round.endBlock >= obj.block) {
  //       thisInfo = round;
  //       break;
  //     }
  //   }
  //   // If it was not cached at all
  //   if (thisInfo == null && !hasRefreshed) {
  //     console.log("Refresh due to non-existing round containing this block");
  //     setRefresh(true);
  //     dispatch(getRoundAtBlock(obj.block));
  //   }
  //   if (thisInfo && thisInfo != roundInfo) {
  //     console.log("Setting block info obj");
  //     setRoundInfo(thisInfo);
  //   }
  // }, [livepeer.rounds]);

  const thisEpoch = obj.time;
  var dateObj = new Date(0);
  dateObj.setUTCSeconds(thisEpoch);
  const thisLocalDate = dateObj.toLocaleString();
  const thisOffset = (-dateObj.getTimezoneOffset() / 60);

  // Get round info
  let thisRoundInfo;
  if (roundInfo) {
    thisRoundInfo = <p style={{ overflowWrap: 'break-word' }}>
      Round {thisRoundInfo.number}
    </p>
  }

  return (
    <div className="rowAlignLeft" style={{ margin: 0, marginTop: '1em', width: '100%' }}>
      <a className="selectOrch" style={{ cursor: 'alias', margin: 0 }} target="_blank" rel="noopener noreferrer" href={obj.url}>
        <img alt="" src="arb.svg" width="20em" height="20em" />
      </a>
      <a className="selectOrch" style={{ cursor: 'alias', margin: 0 }} target="_blank" rel="noopener noreferrer" href={"https://arbiscan.io/block/" + obj.block}>
        <h3 style={{ padding: '0.2em', cursor: 'alias' }}>🔗</h3>
      </a>
      {thisRoundInfo}
      <span className="rowAlignRight darkText mobileSmallerFont" style={{ margin: 0 }}>
        <p style={{ overflowWrap: 'break-word' }}>
          📅&nbsp;{thisLocalDate}
        </p>
        {thisOffset != 0 ? <p className='darkTextSmoll' style={{ overflowWrap: 'break-word' }}>
          ({thisOffset > 0 ? "+" : ""}{thisOffset})
        </p> : null
        }
      </span>
    </div>
  )
}

export default Block;