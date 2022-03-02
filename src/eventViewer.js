import React from "react";
import EventButton from "./eventButton";
import ScrollContainer from 'react-indiana-drag-scroll';

const EventViewer = (obj) => {
  let txCounter = 0;
  let currentTx = "";
  let eventCache = [];
  let eventBundle = [];
  return (
    <div className="stroke roundedOpaque" style={{ padding: 0, margin: 0, marginTop: '2em', position: 'absolute', bottom: 0, top: '200px', left: '0px', right: '0px', overflowY: 'auto', overflowX: 'hidden', width: '100%' }}>
      <div className="content-wrapper">
        <ScrollContainer className="overflow-container" hideScrollbars={false}>
          <div className="overflow-content" style={{ cursor: 'grab' }}>
            {obj.events.slice(0).reverse().map((eventObj, idx) => {
              if (currentTx != eventObj.transactionHash) {
                txCounter++;
                currentTx = eventObj.transactionHash;
                eventBundle = eventCache;
                eventCache = [];
              } else {
                eventCache.push(eventObj);
                return;
              }
              return <EventButton
                key={eventObj.transactionUrl + idx}
                transactionUrl={eventObj.transactionUrl}
                transactionHash={eventObj.transactionHash}
                name={eventObj.name}
                data={eventObj.data}
                address={eventObj.address}
                idx={txCounter}
                subEvents={eventBundle}
              />
            })}
          </div>
        </ScrollContainer>
      </div>
    </div>
  )
}

export default EventViewer;