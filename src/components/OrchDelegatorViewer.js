import React from "react";
import ScrollContainer from "react-indiana-drag-scroll";
import Address from "./OrchAddressViewer";

const OrchDelegatorViewer = (obj) => {
  let delegators = obj.delegators;
  if (delegators && delegators.length) {
    return (
      <div className="row">
        <div className="strokeSmollLeft fullMargin">
          <div className="row">
            <h3>{delegators.length} Current Delegators</h3>
          </div>
          <div className="content-wrapper">
            <ScrollContainer className="overflow-container" hideScrollbars={false} style={{}}>
              <div className="overflow-content" style={{ cursor: 'grab', maxHeight: '300px' }}>
                {
                  delegators.map((delObj, idx) => {
                    return (
                      <div className="flexContainer forceWrap" key={"delegator" + idx}>
                        <Address address={delObj.id} seed={"delegator" + idx + delObj.id} />
                        <div className="rowAlignRight">
                          <p className="darkText">{parseFloat(delObj.bondedAmount).toFixed(2)} LPT since round {delObj.startRound}</p>
                        </div>
                      </div>
                    )
                  })
                }
              </div>
            </ScrollContainer>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="row">
      <div className="strokeSmollLeft">
        <div className="row">
          <h3>The selected Orchestrator has no Delegators</h3>
        </div>
      </div>
    </div >
  )
}

export default OrchDelegatorViewer;