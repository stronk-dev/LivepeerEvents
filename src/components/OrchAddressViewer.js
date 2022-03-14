import React from "react";

const Address = (obj) => {
  return (
    <div className="rowAlignLeft">
      <a className="selectOrchLight" target="_blank" rel="noopener noreferrer" href={"https://explorer.livepeer.org/accounts/" + obj.address} >
        <div className="rowAlignLeft">
          <img alt="" src="livepeer.png" width="20" height="20" />
          <span className="elipsText elipsOnMobile">{obj.address}</span>
        </div>
      </a>
    </div>
  )
}

export default Address;