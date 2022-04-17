import React from "react";

const Ticket = (obj) => {
  return (
    <div className="flexContainer stretchAndBetween">
      <div className="strokeSmoll" style={{flex: 1}}>
        <div className="row">
          <h3>{obj.icon}</h3>
        </div>
        <div className="row">
          <p className="smallTxt">
            {obj.subtext}
          </p>
        </div>
      </div>
      <div className="verticalSeparator"></div>
      <div className="stroke" style={{ flex: 2 }}>
        {obj.descriptions.map(function (thisTextItem, i) {
          return (
            <p className="smallTxt" key={obj.seed + i}>
              {thisTextItem}
            </p>
          )
        })}
      </div>
    </div>
  )
}

export default Ticket;