import React from "react";

const Block = (obj) => {
  const thisEpoch = obj.time;
  var dateObj = new Date(0);
  dateObj.setUTCSeconds(thisEpoch);
  const [thisDate, thisTime] = dateObj.toISOString().split('T');
  return (
    <div className="rowAlignLeft" style={{ margin: 0, marginTop: '1em', width: '100%'}}>
      <a className="selectOrch" style={{ cursor: 'alias', margin: 0 }} target="_blank" rel="noopener noreferrer" href={obj.url}>
        <img alt="" src="arb.svg" width="20em" height="20em" />
      </a>
      <a className="selectOrch" style={{ cursor: 'alias', margin: 0 }} target="_blank" rel="noopener noreferrer" href={"https://arbiscan.io/block/" + obj.block}>
        <h3 style={{ padding: '0.2em', cursor: 'alias' }}>🔗</h3>
      </a>
      <span className="rowAlignRight darkText mobileSmallerFont" style={{margin: 0}}>
        UTC&nbsp;📅{thisDate} - {thisTime.split('.')[0]}
      </span>
    </div>
  )
}

export default Block;