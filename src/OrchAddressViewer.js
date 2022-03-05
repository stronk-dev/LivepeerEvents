import React from "react";
import ReactTooltip from "react-tooltip";

const Address = (obj) => {
  return (
    <div className="rowAlignLeft" style={{ width: 'unset' }}>
      <a href={"https://explorer.livepeer.org/accounts/" + obj.address} data-tip data-for={obj.seed} >
        <div className="rowAlignLeft" style={{ width: 'unset' }}>
          <img alt="" src="livepeer.png" width="20" height="20" />
          {obj.address}
        </div>
      </a>
      <ReactTooltip id={obj.seed} place="top" effect="solid">
        {"https://explorer.livepeer.org/accounts/" + obj.address}
      </ReactTooltip>
    </div>
  )
}

export default Address;