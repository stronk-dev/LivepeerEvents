import React, { useEffect, useState } from "react";
import {
  getRoundInfo
} from "../actions/livepeer";
import { useDispatch, useSelector } from 'react-redux';
import { Popover } from '@mantine/core';

const Round = (obj) => {
  const [opened, setOpened] = useState(false);
  const dispatch = useDispatch();
  const [hasRefreshed, setRefresh] = useState(false);

  useEffect(() => {
    // If it was not cached at all
    if (obj.round && obj.round.number && !obj.round.endBlock && !hasRefreshed) {
      console.log("Pulling round info for round " + obj.round.number);
      setRefresh(true);
      dispatch(getRoundInfo(obj.round.number));
    }
  }, []);

  const thisEpoch = obj.time;
  var dateObj = new Date(0);
  dateObj.setUTCSeconds(thisEpoch);
  const thisLocalDate = dateObj.toLocaleString();
  const thisOffset = (-dateObj.getTimezoneOffset() / 60);

  return (
    <div className="row" style={{ paddingLeft: '1em', paddingRight: '1em' }}>
      <div className="rowAlignLeft" style={{ margin: 0, marginTop: '1em', width: '100%' }}>
        <a className="selectOrch" style={{ cursor: 'alias', margin: 0 }} target="_blank" rel="noopener noreferrer" href={"https://arbiscan.io/block/" + obj.round.blockNumber}>
          <h3 style={{ padding: '0.2em', cursor: 'alias' }}>🔗</h3>
        </a>
        <Popover className="strokeSmollLeft" style={{ cursor: 'pointer', marginTop: '0.2em', marginBottom: '0.2em' }}
          opened={opened}
          onClose={() => setOpened(false)}
          target={
            <p className="darkText" style={{ overflowWrap: 'break-word' }} onClick={() => setOpened((o) => !o)}>
              Round {obj.round.number}
            </p>
          }
          width={260}
          position="right"
          withArrow
        >
          <div className="strokeSmollLeft">
            <div className="row">
              <p className="darkText" style={{ overflowWrap: 'break-word' }}>
                Round {obj.round.number}
              </p>
            </div>
            <div className="smallVerticalDivider"/>
            {
              obj.round.mintableTokens && obj.round.mintableTokens > 0 ?
                <div className="rowAlignLeft">
                  <p className="darkText" style={{ overflowWrap: 'break-word', textAlign: 'left' }}>
                    Has {parseFloat(obj.round.mintableTokens).toFixed(2)} mintable tokens
                  </p>
                </div> : null
            }
            <div className="smallVerticalDivider"/>
            {
              obj.round.volumeEth && obj.round.volumeUsd && obj.round.volumeEth > 0 && obj.round.volumeUsd > 0 ?
                <div className="rowAlignLeft">
                  <p className="darkText" style={{ overflowWrap: 'break-word', textAlign: 'left' }}>
                    A volume of {parseFloat(obj.round.volumeEth).toFixed(2)} Eth ({parseFloat(obj.round.volumeUsd).toFixed(2)}$)
                  </p>
                </div> : null
            }
            <div className="smallVerticalDivider"/>
            {
              obj.round.totalSupply && obj.round.totalActiveStake && obj.round.totalSupply > 0 && obj.round.totalActiveStake > 0 ?
                <div className="rowAlignLeft">
                  <p className="darkText" style={{ overflowWrap: 'break-word', textAlign: 'left' }}>
                    A total supply of {parseFloat(obj.round.totalSupply).toFixed(2)} LPT, of which {parseFloat(obj.round.totalActiveStake).toFixed(2)} is staked ({(parseFloat(obj.round.participationRate) * 100).toFixed(2)}%)
                  </p>
                </div> : null
            }
            <div className="smallVerticalDivider"/>
            {
              obj.round.newStake && obj.round.newStake > 0 ?
                <div className="rowAlignLeft">
                  <p className="darkText" style={{ overflowWrap: 'break-word', textAlign: 'left' }}>
                    {parseFloat(obj.round.newStake).toFixed(2)} LPT new stake
                  </p>
                </div> : null
            }
            <div className="smallVerticalDivider"/>
            {
              obj.round.movedStake && obj.round.movedStake > 0 ?
                <div className="rowAlignLeft">
                  <p className="darkText" style={{ overflowWrap: 'break-word', textAlign: 'left' }}>
                    {parseFloat(obj.round.movedStake).toFixed(2)} LPT stake moved around
                  </p>
                </div> : null
            }
            <div className="smallVerticalDivider"/>
          </div>

        </Popover>
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
    </div>
  )
}

export default Round;