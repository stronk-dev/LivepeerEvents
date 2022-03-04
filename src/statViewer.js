import React from "react";

const Stat = (obj) => {
  console.log(obj);
  return (
    <div className="strokeSmollLeft" style={{margin: 0, padding: 0}}>
      <div className="rowAlignLeft" style={{margin: 0, padding: 0}}>
        <h4 style={{margin: 0, padding: 0}}>{obj.header}</h4>
      </div>
      <div className="rowAlignLeft" style={{margin: 0, marginLeft: '1em', padding: 0}}>
        <p style={{margin: 0, padding: 0}}>{obj.content}</p>
      </div>
    </div>
  )
}

export default Stat;