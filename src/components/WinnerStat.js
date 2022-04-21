import React, { useState, useEffect } from 'react'
import Address from '../components/OrchAddressViewer';
import { Popover } from '@mantine/core';
import ScoreView from './scoreViewer';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const Winner = (obj) => {
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    let score = 0;
    if (obj.thisScore) {
      score = (obj.thisScore["FRA"].score + obj.thisScore["LAX"].score + obj.thisScore["LON"].score + obj.thisScore["MDW"].score + obj.thisScore["NYC"].score + obj.thisScore["PRG"].score + obj.thisScore["SIN"].score) / 7;
      if (obj.thisScore != score) {
        setobj.thisScore(score);
      }
    }
  }, [obj.stats]);

  let scoreObj = null;
  if (obj.thisScore) {
    scoreObj =
      <Popover className="strokeSmollLeft" style={{ cursor: 'pointer', marginTop: '0.2em', marginBottom: '0.2em' }}
        opened={opened}
        onClose={() => setOpened(false)}
        target={
          <div className="strokeSmollLeft" style={{ width: '4em', height: '4em', marginLeft: '2em' }} onClick={() => setOpened((o) => !o)} >
            <CircularProgressbar value={obj.thisScore} maxValue={1} text={`${((obj.thisScore * 10).toFixed(1))}`}
              styles={{
                root: {},
                path: {
                  stroke: `rgba(20, 153, 53, ${obj.thisScore})`,
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
        <ScoreView score={obj.stats.scores[obj.address]} />
      </Popover>
  }

  return (
    <div className="row">
      <div className="rowAlignLeft">
        <Address address={obj.address} seed={obj.seed} />
      </div>
      <div className="strokeSmollLeft" style={{ minWidth: '100px' }} >
        <div className="rowAlignLeft" >
          <h4>{obj.thisEarnings.sum.toFixed(4)} Eth</h4>
        </div>
        <div className="rowAlignRight" >
          <span>({((obj.thisEarnings.sum / obj.totalEarnings) * 100).toFixed(2)} %)</span>
        </div>
      </div>
      {obj.thisStake ?
        <div className="strokeSmollLeft" style={{ minWidth: '100px' }} >
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
            <span>{obj.thisCommission.rewardCommission.toFixed(2)}% Reward</span>
          </div>
          <div className="rowAlignRight" >
            <span>{obj.thisCommission.feeCommission.toFixed(2)}% Fee</span>
          </div>
        </div> : null
      }
      {scoreObj}
    </div>
  )
}

export default Winner;