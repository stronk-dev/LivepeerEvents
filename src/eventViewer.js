import React from "react";
import EventButton from "./eventButton";
import ScrollContainer from 'react-indiana-drag-scroll';

const EventViewer = (obj) => {
  let txCounter = 0;
  let currentTx = "";
  let currentUrl = "";
  let currentHash = "";
  let eventCache = [];

  let eventBundle = [];
  let finalUrl = "";
  let finalHash = "";
  let finalIdx = 0;
  return (
    <div className="stroke roundedOpaque" style={{ padding: 0, margin: 0, marginTop: '2em', position: 'absolute', bottom: 0, top: '300px', left: '0px', right: '0px', overflowY: 'auto', overflowX: 'hidden', width: '100%' }}>
      <div className="content-wrapper">
        <ScrollContainer className="overflow-container" hideScrollbars={false}>
          <div className="overflow-content" style={{ cursor: 'grab' }}>
            {obj.events.slice(0).reverse().map((eventObj, idx) => {
              // Filter
              if (eventObj.name == "WithdrawFees" || eventObj.name == "TransferBond"
              || eventObj.name == "Rebond" || eventObj.name == "Unbond" || eventObj.name == "EarningsClaimed"){
                return;
              }
              // New transaction found
              if (currentTx != eventObj.transactionHash) {
                // Save old event data
                eventBundle = eventCache;
                finalUrl = currentUrl;
                finalHash = currentHash;
                finalIdx = txCounter;
                // Reset event data
                currentTx = eventObj.transactionHash;
                currentUrl = eventObj.transactionUrl;
                currentHash = eventObj.transactionHash;
                eventCache = [eventObj];
                txCounter++;
              } else {
                // Push event to current cache
                eventCache.push(eventObj);
                return;
              }
              // Push if not completely filtered out
              if (eventBundle.length){
                return <EventButton
                  key={eventObj.transactionHash+idx}
                  transactionUrl={finalUrl}
                  transactionHash={finalHash}
                  events={eventBundle}
                  idx={finalIdx}
                  setOrchFunction={obj.setOrchFunction}
                />
              }
            })}
          </div>
        </ScrollContainer>
      </div>
    </div>
  )
}

export default EventViewer;