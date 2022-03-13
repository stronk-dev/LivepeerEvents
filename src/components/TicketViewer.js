import React from "react";

const Ticket = (obj) => {
  return (
    <div className="flexContainer" style={{ justifyContent: 'space-between', alignItems: "stretch", width: "100%" }}>
      <div className="strokeSmoll">
        <div className="row">
          <h3 style={{ margin: 0, padding: 0 }}>{obj.icon}</h3>
        </div>
        <div className="row">
          <p style={{ fontSize: 'small' }}>
            {obj.subtext}
          </p>
        </div>
      </div>
      <div className="verticalSeparator"></div>
      <div className="flexContainer">
        {obj.descriptions.map(function (thisTextItem, i) {
          return (
            <p style={{ fontSize: 'small' }}>
              {thisTextItem}
            </p>
          )
        })}
      </div>
    </div>
  )
}

export default Ticket;