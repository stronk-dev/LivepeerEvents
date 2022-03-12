import React from "react";

const Address = (obj) => {
  return (
    <div className="rowAlignLeft" style={{ width: 'unset', margin: 0 }}>
      <a className="selectOrchLight" target="_blank" rel="noopener noreferrer" href={"https://explorer.livepeer.org/accounts/" + obj.address} >
        <div className="rowAlignLeft" style={{ width: 'unset', margin: 0 }}>
          <img alt="" src="livepeer.png" width="20" height="20" />
          <span className="elipsText elipsOnMobile" style={{ marginRight: "0.5em" }}>{obj.address}</span>
        </div>
      </a>
    </div>
  )
}

export default Address;