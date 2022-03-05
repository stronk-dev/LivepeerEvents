import React from "react";

const Block = (obj) => {
  return (
    <div className="rowAlignLeft" style={{ width: '100%' }}>
      <span className="rowAlignRight elipsText">
        Block {obj.block}
      </span>
    </div>
  )
}

export default Block;