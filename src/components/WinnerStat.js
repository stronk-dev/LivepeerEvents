import React, { useState, useEffect } from 'react'
import Address from '../components/OrchAddressViewer';
import { Popover } from '@mantine/core';
import ScoreView from './scoreViewer';

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
      <Popover className="strokeSmollLeft" style={{ minWidth: '100px', cursor: 'pointer' }}
        opened={opened}
        onClose={() => setOpened(false)}
        target={
          <div className="strokeSmollLeft" onClick={() => setOpened((o) => !o)} >
            <div className="rowAlignLeft" >
              <h4>Global Score</h4>
            </div>
            <div className="rowAlignRight" >
              <span>{(thisScore * 10).toFixed(1)}</span>
            </div>
          </div>
        }
        width={260}
        position="bottom"
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