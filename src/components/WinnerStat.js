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
          <div className="strokeSmollLeft" style={{ width: '3em', height: '3em', marginLeft: '2em' }} onClick={() => setOpened((o) => !o)} >
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
    <div className="stroke hostInfo" style={{ padding: '1em', cursor: 'grab', width: '100%' }} >
      <div className="row">
        <div className="strokeSmollLeft" style={{ marginLeft: '0.2em', whiteSpace: 'nowrap' }} >
          <h3>{obj.thisIndex}</h3>
        </div>
        <div className="rowAlignLeft">
          <Address address={obj.address} seed={obj.seed} />
        </div>
        {scoreObj}
      </div>
      <div className="row">
        {obj.thisEarnings ? <div className="strokeSmollLeft" style={{ minWidth: '50px' }} >
          <div className="rowAlignLeft" >
            <h3>Fees</h3>
          </div>
          <div className="rowAlignRight" >
            <span>{obj.thisEarnings.sum.toFixed(4)} Eth</span>
          </div>
          <div className="rowAlignRight" >
            <span>({((obj.thisEarnings.sum / obj.totalEarnings) * 100).toFixed(2)} %)</span>
          </div>
        </div> : <div className="strokeSmollLeft" style={{ minWidth: '50px' }} />
        }
        {obj.thisStake ?
          <div className="strokeSmollLeft" style={{ minWidth: '50px' }} >
            <div className="rowAlignLeft" >
              <h3>Stake</h3>
            </div>
            <div className="rowAlignRight" >
              <span>{obj.thisStake.totalStake.toFixed(2)} LPT</span>
            </div>
            <div className="rowAlignRight" >
              <span>({((obj.thisStake.totalStake / obj.totalStake) * 100).toFixed(2)} %)</span>
            </div>
          </div> : <div className="strokeSmollLeft" style={{ minWidth: '50px' }} />
        }
        {obj.thisCommission ?
          <div className="strokeSmollLeft" style={{ minWidth: '50px' }} >
            <div className="rowAlignLeft" >
              <h3>Commission</h3>
            </div>
            <div className="rowAlignRight" >
              <span>{obj.thisCommission.rewardCommission.toFixed(2)}% Reward</span>
            </div>
            <div className="rowAlignRight" >
              <span>{obj.thisCommission.feeCommission.toFixed(2)}% Fee</span>
            </div>
          </div> : <div className="strokeSmollLeft" style={{ minWidth: '50px' }} />
        }
      </div>
    </div>
  )
}

export default Winner;