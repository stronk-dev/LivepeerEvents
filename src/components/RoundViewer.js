import React, { useEffect, useState } from "react";
import {
  getRoundInfo
} from "../actions/livepeer";
import { useDispatch, useSelector } from 'react-redux';
import { Popover } from '@mantine/core';
import { getOrchestratorByDelegator } from "../util/livepeer";

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
            {
              obj.round.mintableTokens ?
                <div className="row">
                  <p className="darkText" style={{ overflowWrap: 'break-word' }}>
                    Has {obj.round.mintableTokens.toFixed(2)} mintable tokens
                  </p>
                </div> : null
            }
            {
              obj.round.volumeEth && obj.round.volumeUsd ?
                <div className="row">
                  <p className="darkText" style={{ overflowWrap: 'break-word' }}>
                    A volume of {obj.round.volumeEth.toFixed(2)} Eth ({obj.round.volumeUsd.toFixed(2)}$)
                  </p>
                </div> : null
            }
            {
              obj.round.totalSupply && obj.round.totalActiveStake ?
                <div className="row">
                  <p className="darkText" style={{ overflowWrap: 'break-word' }}>
                    A total supply of {obj.round.totalSupply.toFixed(2)} LPT, of which {obj.round.totalActiveStake.toFixed(2)} is staked ({(obj.round.participationRate * 100).toFixed(2)}%)
                  </p>
                </div> : null
            }
            {
              obj.round.newStake ?
                <div className="row">
                  <p className="darkText" style={{ overflowWrap: 'break-word' }}>
                    {obj.round.newStake.toFixed(2)} LPT new stake
                  </p>
                </div> : null
            }
            {
              obj.round.movedStake ?
                <div className="row">
                  <p className="darkText" style={{ overflowWrap: 'break-word' }}>
                    {obj.round.movedStake.toFixed(2)} LPT stake moved around
                  </p>
                </div> : null
            }
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