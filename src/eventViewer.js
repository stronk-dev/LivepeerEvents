import React from "react";
import EventButton from "./eventButton";

const EventViewer = (obj) => {
  return (
    <div className="roundedOpaque flexContainer hostinfo scrollWindow" style={{ width: 'unset', justifyContent: 'center', alignContent: 'center', alignItems: 'center', marginBottom: '20px', marginTop: '20px', flexDirection: 'column' }}>
      {obj.events.map((eventObj, idx) => {
        console.log(eventObj);
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