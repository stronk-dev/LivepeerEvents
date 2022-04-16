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
    // Get score of this Orch
    let thisScore = null;
    if (obj.stats) {
      thisScore = obj.stats.scores[obj.address];
    }

    let score = 0;
    if (thisScore) {
      score = (thisScore["FRA"].score + thisScore["LAX"].score + thisScore["LON"].score + thisScore["MDW"].score + thisScore["NYC"].score + thisScore["PRG"].score + thisScore["SIN"].score) / 7;
      if (thisScore != score) {
        setThisScore(score);
      }
    }
  }, [obj.stats]);

  let scoreObj = null;
  if (thisScore) {
    scoreObj =
      <Popover className="strokeSmollLeft" style={{ cursor: 'pointer', marginTop:  '0.2em', marginBottom:  '0.2em' }}
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
            }}/>
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
        <Address address={obj.address} seed={"delegator" + obj.address + obj.sum} />
      </div>
      <div className="strokeSmollLeft" style={{ minWidth: '100px' }} >
        <div className="rowAlignLeft" >
          <h4>{obj.sum.toFixed(4)} Eth</h4>
        </div>
        <div className="rowAlignRight" >
          <span>({((obj.sum / obj.total) * 100).toFixed(2)} %)</span>
        </div>
      </div>
      {scoreObj}
    </div>
  )
}

export default Winner;