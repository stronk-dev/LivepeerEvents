import React from "react";
import EventButton from "./eventButton";
import ScrollContainer from 'react-indiana-drag-scroll';

const EventViewer = (obj) => {
  return (
    <div className="stroke roundedOpaque" style={{ padding: 0, margin: 0, marginTop: '2em', position: 'absolute', bottom: 0, top: '200px', left: '0px', right: '0px', overflowY: 'auto', overflowX: 'hidden', width: '100%' }}>
      {obj.events.map((eventObj, idx) => {
        // TODO: make something that groups shit as long as the eventObj.transactionUrl is the same
        return <EventButton
          key={eventObj.transactionUrl + idx}
          transactionUrl={eventObj.transactionUrl}
          transactionHash={eventObj.transactionHash}
          name={eventObj.name}
          data={eventObj.data}
          address={eventObj.address}
        />
      })}
    </div>
  )
}

export default EventViewer;