import React, { useState, useEffect } from 'react';
import ScrollContainer from "react-indiana-drag-scroll";
import Address from "./OrchAddressViewer";
import { Pagination } from "@mantine/core";

const itemsPerPage = 10;

const OrchDelegatorViewer = (obj) => {
  const [activePage, setPage] = useState(1);
  let delegators = obj.delegators;
  let sortedList = [];
  if (delegators && delegators.length) {
    let tmpCopy = [...delegators];
    while (tmpCopy.length) {
      let ticketIdx2 = tmpCopy.length - 1;
      let largestIdx = 0;
      let largestValue = 0;

      // Find current O with most ticket wins in Eth
      while (ticketIdx2 >= 0) {
        const currentOrch = tmpCopy[ticketIdx2];
        let thisVal = parseFloat(currentOrch.bondedAmount);

        if (thisVal > largestValue) {
          largestIdx = ticketIdx2;
          largestValue = thisVal;
        }
        ticketIdx2 -= 1;
      }
      // Push current biggest list
      sortedList.push(tmpCopy[largestIdx]);
      // Remove from list
      tmpCopy.splice(largestIdx, 1);
    }

    const totalPages = (delegators.length + (itemsPerPage - (delegators.length % itemsPerPage))) / itemsPerPage;

    return (
      <div className="row">
        <div className="strokeSmollLeft fullMargin" style={{ paddingBottom: 0, marginBottom: 0 }}>
          <div className="row">
            <h3>{delegators.length} Current Delegators</h3>
          </div>
          <div className="content-wrapper">
            <ScrollContainer className="overflow-container" hideScrollbars={false} style={{}}>
              <div className="overflow-content" style={{ cursor: 'grab', maxHeight: '300px' }}>
                {
                  sortedList.map((delObj, idx) => {
                    const tmp = idx - ((activePage - 1) * itemsPerPage);
                    if (tmp >= 0 && tmp < itemsPerPage) {
                      return (
                        <div className="flexContainer forceWrap" key={"delegator" + idx}>
                          <div className="rowAlignLeft">
                            <div className="strokeSmollLeft" style={{ marginLeft: '0.2em', whiteSpace: 'nowrap' }} >
                              <h3>{idx + 1}</h3>
                            </div>
                            <div className="rowAlignLeft">
                              <Address address={delObj.id} seed={"delegator" + idx + delObj.id} />
                            </div>
                          </div>
                          <div className="rowAlignRight">
                            <p className="darkText">{parseFloat(delObj.bondedAmount).toFixed(2)} LPT since round {delObj.startRound}</p>
                          </div>
                        </div>
                      )
                    }
                    return null;
                  })
                }
              </div>
            </ScrollContainer>
          </div>
          <div className="row" style={{ marginTop: '1em', marginBottom: '1em' }}>
            {totalPages > 1 ?
              <Pagination page={activePage} onChange={setPage} total={totalPages} siblings={1} initialPage={1} />
              : null}
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
        <div className="verticalDivider" />
      </div>
    </div >
  )
}

export default OrchDelegatorViewer;