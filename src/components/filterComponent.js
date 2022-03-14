import React from "react";

const greyColour = "rgba(122, 128, 127, 0.3)";

const Filter = (obj) => {
  let searchTermText;
  if (obj.searchTerm !== "") {
    if (obj.searchTerm.length > 15) {
      searchTermText = <h3>Only showing addresses containing {obj.searchTerm.substring(0, 15)}...</h3>
    } else {
      searchTermText = <h3>Only showing addresses containing {obj.searchTerm}</h3>
    }
  } else {
    searchTermText = <h3>Filter by Orchestrator address</h3>
  }

  return (
    <div className="flexContainer" style={{  width: '100%' }}>
      <div className="strokeSmollLeft" style={{ flex: 2 }}>
        <div className="row">
          {searchTermText}
        </div>
        <div className="row">
          <div className="strokeSmollLeft">
            <button className={"nonHomeButton buttonPadding"} style={{ backgroundColor: greyColour, width: '5em' }} onClick={() => {
              obj.setSearchTerm("");
            }}>
              <h3>Clear</h3>
            </button>
          </div>
          <input className="searchField" style={{ height: '2em', width: '100%' }}
            value={obj.searchTerm}
            onChange={(evt) => obj.setSearchTerm(evt.target.value)}
            placeholder='Filter by Orchestrator address'
            type="text"
          />
        </div>
      </div>
      <div className="verticalSeparator"/>
      <div className="strokeSmollLeft" style={{ flex: 2 }}>
        <div className="row">
          <h3>{parseFloat(obj.amountFilter) > 0 ? ("Only showing higher than " + obj.amountFilter) : "Filter by minimum value"}</h3>
        </div>
        <div className="row">
          <div className="strokeSmollLeft">
            <button className={"nonHomeButton buttonPadding"} style={{ backgroundColor: greyColour, width: '5em' }} onClick={() => {
              obj.setAmountFilter(0);
            }}>
              <h3>0</h3>
            </button>
          </div>
          <input className="searchField" style={{ height: '2em', width: '100%' }}
            value={obj.amountFilter}
            onChange={(evt) => obj.setAmountFilter(evt.target.value)}
            placeholder='Filter by minimum value'
            type="number"
          />
          <div className="strokeSmollLeft">
            <button className={"nonHomeButton buttonPadding"} style={{ backgroundColor: greyColour, width: '4em' }} onClick={() => {
              const curVal = parseFloat(obj.amountFilter);
              obj.setAmountFilter(curVal + 100);
            }}>
              <h3>+100</h3>
            </button>
          </div>
          <div className="strokeSmollLeft">
            <button className={"nonHomeButton buttonPadding"} style={{ backgroundColor: greyColour, width: '5em' }} onClick={() => {
              const curVal = parseFloat(obj.amountFilter);
              obj.setAmountFilter(curVal + 1000);
            }}>
              <h3>+1000</h3>
            </button>
          </div>
        </div>
      </div>
      <div className="verticalDivider" />
    </div>
  )
}

export default Filter;