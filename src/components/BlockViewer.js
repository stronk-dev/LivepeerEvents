import React from "react";

const Block = (obj) => {
  const thisEpoch = obj.time;
  var dateObj = new Date(0);
  dateObj.setUTCSeconds(thisEpoch);
  const [thisDate, thisTime] = dateObj.toISOString().split('T');
  return (
    <div className="rowAlignLeft" style={{ width: '100%', marginTop: '1em' }}>
      <a className="selectOrch" style={{ cursor: 'alias' }} target="_blank" rel="noopener noreferrer" href={obj.url}>
        <img alt="" src="arb.svg" width="30em" height="30em" />
      </a>
      <a className="selectOrch" style={{ cursor: 'alias' }} target="_blank" rel="noopener noreferrer" href={"https://arbiscan.io/block/" + obj.block}>
        <h2 style={{ margin: 0, padding: '0.2em', cursor: 'alias' }}>🔗</h2>
      </a>
      <span className="rowAlignRight elipsText">
        <p className="darkText mobileSmallerFont">UTC&nbsp;📅{thisDate} - {thisTime.split('.')[0]} </p>
      </span>
    </div>
  )
}




export default Block;