import React, { useState } from "react";
import EventButton from "./eventButton";
import ScrollContainer from 'react-indiana-drag-scroll';

const TicketViewer = (obj) => {
  console.log("Rendering TicketViewer");
  let unfiltered = 0;
  let prevBlock = 0;
  let ticketList = [];
  for (const ticketObj of obj.tickets) {
    unfiltered++;
    if (prevBlock === ticketObj.transactionBlock) {
      ticketList.push(<EventButton
        key={ticketObj.transactionHash + unfiltered}
        eventObj={ticketObj}
        setSearchTerm={obj.setSearchTerm}
      />);
    } else {
      prevBlock = ticketObj.transactionBlock;
      ticketList.push(<EventButton
        key={ticketObj.transactionHash + unfiltered}
        eventObj={ticketObj}
        isFirstOfBlock={prevBlock}
        time={ticketObj.transactionTime}
        setSearchTerm={obj.setSearchTerm}
      />);
    }
  }

  return (
    <div className="strokeSmollLeft" style={{ padding: 0, margin: 0, height: 'calc( 100vh - 50px)' }}>
      <div className="row" style={{ padding: 0, margin: 0, width: '100%', height: '100%' }}>
        <div className="stroke roundedOpaque" style={{ padding: 0, margin: 0, width: 'unset', height: '100%', marginRight: '1em', overflow: 'hidden', marginTop: '1em', overflowX: 'scroll' }}>
          <div className="content-wrapper" style={{ width: '100%' }}>
            <ScrollContainer className="overflow-container" hideScrollbars={false}>
              <div className="overflow-content" style={{ cursor: 'grab', paddingTop: 0 }}>
                <div className={obj.forceVertical ? "flexContainer forceWrap" : "flexContainer"} style={{ margin: 0, textAlign: 'center', alignItems: 'center', justifyContent: 'center' }}>
                  {ticketList}
                </div>
              </div>
            </ScrollContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TicketViewer;