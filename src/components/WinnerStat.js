import React, { useState, useEffect } from 'react'
import Address from '../components/OrchAddressViewer';
import { Popover } from '@mantine/core';
import ScoreView from './scoreViewer';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const Winner = (obj) => {
  const [thisScore, setThisScore] = useState(0);
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    let score = 0;
    let count = 0;
    if (obj.thisScore) {
      if (obj.thisScore["FRA"]) {
        count++;
        score += obj.thisScore["FRA"].score;
      }
      if (obj.thisScore["LAX"]) {
        count++;
        score += obj.thisScore["LAX"].score;
      }
      if (obj.thisScore["LON"]) {
        count++;
        score += obj.thisScore["LON"].score;
      }
      if (obj.thisScore["MDW"]) {
        count++;
        score += obj.thisScore["MDW"].score;
      }
      if (obj.thisScore["NYC"]) {
        count++;
        score += obj.thisScore["NYC"].score;
      }
      if (obj.thisScore["PRG"]) {
        count++;
        score += obj.thisScore["PRG"].score;
      }
      if (obj.thisScore["SIN"]) {
        count++;
        score += obj.thisScore["SIN"].score;
      }
      score /= count;
      if (obj.thisScore != score) {
        setThisScore(score);
      }
    }
  }, [obj.thisScore]);

  let scoreObj = null;
  if (obj.thisScore) {
    scoreObj =
      <Popover className="strokeSmollLeft" style={{ cursor: 'pointer', marginTop: '0.2em', marginBottom: '0.2em' }}
        opened={opened}
        onClose={() => setOpened(false)}
        target={
          <div className="strokeSmollLeft" style={{ width: '4em', height: '4em', marginLeft: '2em' }} onClick={() => setOpened((o) => !o)} >
            <CircularProgressbar value={thisScore} maxValue={1} text={`${((thisScore * 10).toFixed(1))}`}
              styles={{
                root: {},
                path: {
                  stroke: `rgba(20, 153, 53, ${thisScore})`,
                  strokeLinecap: 'round',
                  transition: 'stroke-dashoffset 0.5s ease 0s',
                  transformOrigin: 'center center',
                },
                trail: {
                  stroke: '#d66400',
                  strokeLinecap: 'rounnd',
                  transformOrigin: 'center center',
                },
                text: {
                  fill: 'rgba(0, 0, 0, 0.875)',
                  fontSize: '32px',
                },
                background: {
                  fill: '#3e98c7',
                },
              }} />
          </div>
        }
        width={260}
        position="right"
        withArrow
      >
        <ScoreView score={obj.thisScore} />
      </Popover>
  }

  return (
    <div className="stroke hostInfo" style={{ padding: '1em', cursor: 'grab' }} >
      <div className="row">
        <div className="rowAlignLeft">
          <Address address={obj.address} seed={obj.seed} />
        </div>
        {scoreObj}
      </div>
      <div className="row">
        {obj.thisEarnings ? <div className="strokeSmollLeft" style={{ minWidth: '100px' }} >
          <div className="rowAlignLeft" >
            <h3>Fees</h3>
          </div>
          <div className="rowAlignLeft" >
            <h4>{obj.thisEarnings.sum.toFixed(4)} Eth</h4>
          </div>
          <div className="rowAlignRight" >
            <span>({((obj.thisEarnings.sum / obj.totalEarnings) * 100).toFixed(2)} %)</span>
          </div>
        </div> : null
        }
        {obj.thisStake ?
          <div className="strokeSmollLeft" style={{ minWidth: '100px' }} >
            <div className="rowAlignLeft" >
              <h3>Stake</h3>
            </div>
            <div className="rowAlignLeft" >
              <h4>{obj.thisStake.totalStake.toFixed(4)} LPT</h4>
            </div>
            <div className="rowAlignRight" >
              <span>({((obj.thisStake.totalStake / obj.totalStake) * 100).toFixed(2)} %)</span>
            </div>
          </div> : null
        }
        {obj.thisCommission ?
          <div className="strokeSmollLeft" style={{ minWidth: '100px' }} >
            <div className="rowAlignLeft" >
              <h3>Commission</h3>
            </div>
            <div className="rowAlignRight" >
              <span>{obj.thisCommission.rewardCommission.toFixed(2)}% Reward</span>
            </div>
            <div className="rowAlignRight" >
              <span>{obj.thisCommission.feeCommission.toFixed(2)}% Fee</span>
            </div>
          </div> : null
        }
      </div>
    </div>
  )
}

export default Winner;