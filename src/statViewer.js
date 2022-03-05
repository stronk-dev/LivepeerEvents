import React from "react";

const Stat = (obj) => {
  let statLeft;
  if (obj.title1 || obj.content1) {

  }
  let statRight;
  if (obj.title2 || obj.content2) {

  }

  return (
    <div className="strokeSmollLeft" style={{ margin: 0, padding: 0, width: '100%' }}>
      <div className="rowAlignLeft" style={{ margin: 0, padding: 0 }}>
        <h3 style={{ margin: 0, padding: 0 }}>{obj.header}</h3>
      </div>
      <div className="row" style={{}}>
      <div className="strokeSmollLeft" style={{ margin: 0, padding: 0 }}>
          <h4 style={{ margin: 0, padding: 0 }}>{obj.title1}</h4>
          <div className="rowAlignLeft" style={{ margin: 0, marginLeft: '1em', padding: 0 }}>
          <p className="darkText">{obj.content1}</p>
          </div>
        </div>
        <div className="strokeSmollLeft" style={{ margin: 0, padding: 0 }}>
          <h4 style={{ margin: 0, padding: 0 }}>{obj.title2}</h4>
          <div className="rowAlignLeft" style={{ margin: 0, marginLeft: '1em', padding: 0 }}>
            <p className="darkText">{obj.content2}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Stat;