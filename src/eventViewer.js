import React from "react";
import EventButton from "./eventButton";
import ScrollContainer from 'react-indiana-drag-scroll';

const EventViewer = (obj) => {
  let txCounter = 0;
  let currentTx = "";
  return (
    <div className="stroke roundedOpaque" style={{ padding: 0, margin: 0, marginTop: '2em', position: 'absolute', bottom: 0, top: '200px', left: '0px', right: '0px', overflowY: 'auto', overflowX: 'hidden', width: '100%' }}>
        <div className="content-wrapper">
          <ScrollContainer className="overflow-container" hideScrollbars={false}>
            <div className="overflow-content" style={{ cursor: 'grab' }}>
              {obj.events.map((eventObj, idx) => {
                if(currentTx != eventObj.transactionHash){
                  txCounter++;
                  currentTx = eventObj.transactionHash;
                }
                // TODO: make something that groups shit as long as the eventObj.transactionUrl is the same
                return <EventButton
                  key={eventObj.transactionUrl + idx}
                  transactionUrl={eventObj.transactionUrl}
                  transactionHash={eventObj.transactionHash}
                  name={eventObj.name}
                  data={eventObj.data}
                  address={eventObj.address}
                  idx={txCounter}
                />
              })}
            </div>
          </ScrollContainer>
        </div>
    </div>
  )
}

export default EventViewer;