import React from "react";

const Stat = (obj) => {
  let statLeft;
  if (obj.title1 || obj.content1) {

  }
  let statRight;
  if (obj.title2 || obj.content2) {

  }

  return (
    <div className="strokeSmollLeft">
      <div className="rowAlignLeft" >
        <h3 >{obj.header}</h3>
      </div>
      <div className="row">
        <div className="strokeSmollLeft" >
          <div className="rowAlignLeft" >
            <h4 >{obj.title1}</h4>
          </div>
          <div className="rowAlignRight" >
            <p className="darkText">{obj.content1}</p>
          </div>
        </div>
        <div className="strokeSmollLeft" >
          <div className="rowAlignLeft" >
            <h4 >{obj.title2}</h4>
          </div>
          <div className="rowAlignRight" >
            <p className="darkText">{obj.content2}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Stat;