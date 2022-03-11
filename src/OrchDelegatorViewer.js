import React from "react";
import ScrollContainer from "react-indiana-drag-scroll";
import Address from "./OrchAddressViewer";

const OrchDelegatorViewer = (obj) => {
  let delegators = obj.delegators;
  if (delegators && delegators.length) {
    return (
      <div className="row" style={{ width: 'unset', marginBottom: '1em', marginTop: '1em' }}>
        <div className="strokeSmollLeft" style={{ display: "flex" }}>
          <div className="row" style={{ margin: '0' }}>
            <h3 style={{ padding: 0, margin: 0 }}>{delegators.length} Current Delegators</h3>
          </div>
          <div className="content-wrapper">
            <ScrollContainer className="overflow-container" hideScrollbars={false}>
              <div className="overflow-content" style={{ cursor: 'grab', padding: 0, maxHeight: '300px' }}>
                {
                  delegators.map((delObj, idx) => {
                    return (
                      <div className="flexContainer forceWrap" key={"delegator" + idx} style={{ margin: 0, textAlign: 'center',alignItems: 'center', justifyContent:'center' }}>
                        <Address address={delObj.id} seed={"delegator" + idx + delObj.id} />
                        <div className="rowAlignRight" style={{ margin: 0 }}>
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
    <div className="row" style={{ width: 'unset', marginBottom: '1em', marginTop: '1em' }}>
      <div className="strokeSmollLeft" style={{ display: "flex" }}>
        <div className="row" style={{ margin: '0' }}>
          <h3 style={{ padding: 0, margin: 0 }}>The selected Orchestrator has no Delegators</h3>
        </div>
      </div>
    </div>
  )
}

export default OrchDelegatorViewer;