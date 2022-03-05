import React from "react";

const Block = (obj) => {
  const thisEpoch = obj.time;
  var dateObj = new Date(0);
  dateObj.setUTCSeconds(thisEpoch);
  const [thisDate, thisTime] = dateObj.toISOString().split('T');
  return (
    <div className="rowAlignLeft" style={{ width: '100%' }}>
      <span className="rowAlignRight elipsText">
        <a className="selectOrch" href={"https://arbiscan.io/block/" + obj.block}>
          🔗{obj.block}
        </a>
        <p className="darkText">📅{thisDate} - {thisTime.split('.')[0]} </p>
      </span>
    </div>
  )
}




export default Block;