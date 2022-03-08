import React, { useState } from "react";
import EventButton from "./eventButton";
import ScrollContainer from 'react-indiana-drag-scroll';
import ReactPaginate from 'react-paginate';
/// A scrollable and filterable list of EventButtons

const activationColour = "rgba(23, 60, 122, 0.3)";
const rewardColour = "rgba(20, 99, 29, 0.3)";
const updateColour = "rgba(122, 63, 23, 0.3)";
const withdrawStakeColour = "rgba(115, 110, 22, 0.3)";
const stakeColour = "rgba(71, 23, 122, 0.3)";
const claimColour = "rgba(77, 91, 42, 0.3)";
const unbondColour = "rgba(122, 23, 51, 0.3)";
const greyColour = "rgba(122, 128, 127, 0.3)";

const defaultMaxShown = 100;
const defaultIncrementMaxShown = 100;

const EventViewer = (obj) => {
  const [filterActivated, setFilterActivated] = useState(true);
  const [rewardActivated, setRewardActivated] = useState(true);
  const [updateActivated, setUpdateActivated] = useState(true);
  const [withdrawActivated, setWithdrawActivated] = useState(true);
  const [stakeActivated, setStakeActivated] = useState(true);
  const [delegatorRewardActivated, setDelegatorRewardActivated] = useState(true);
  const [unbondActivated, setUnbondActivated] = useState(true);
  console.log("Rendering EventViewer");
  let unfiltered = 0;
  let limitShown = obj.events.length;

  let filterActivatedColour;
  filterActivatedColour = filterActivated ? activationColour : greyColour;
  let rewardActivatedColour;
  rewardActivatedColour = rewardActivated ? rewardColour : greyColour;
  let updateActivatedColour;
  updateActivatedColour = updateActivated ? updateColour : greyColour;
  let withdrawActivatedColour;
  withdrawActivatedColour = withdrawActivated ? withdrawStakeColour : greyColour;
  let stakeActivatedColour;
  stakeActivatedColour = stakeActivated ? stakeColour : greyColour;
  let delegatorActivatedColour;
  delegatorActivatedColour = delegatorRewardActivated ? claimColour : greyColour;
  let unbondActivatedColour;
  unbondActivatedColour = unbondActivated ? unbondColour : greyColour;

  let prevBlock = 0;
  let showMoreBlock;
  if (obj.maxAmount < limitShown) {
    showMoreBlock = <button className={"nonHomeButton"} style={{ backgroundColor: greyColour, margin: 0, padding: '0', width: '5em' }} onClick={() => {
      obj.setMaxAmount(obj.maxAmount + defaultIncrementMaxShown);
    }}>
      <h3>Show more</h3>
    </button>
  }
  let showLessBlock;
  if (defaultMaxShown < obj.maxAmount) {
    showLessBlock = <button className={"nonHomeButton"} style={{ backgroundColor: greyColour, margin: 0, padding: '0', width: '5em' }} onClick={() => {
      obj.setMaxAmount(defaultMaxShown);
    }}>
      <h3>Show {defaultMaxShown}</h3>
    </button>
  } else {
    showLessBlock = <div className="strokeSmollLeft" style={{ margin: 0, padding: 0, width: '5em' }}></div>
  }

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

  let eventList = [];
  for (const eventObj of obj.events) {
    if (unfiltered > obj.maxAmount) {
      break;
    }
    // Filter by minimum value
    if (obj.amountFilter !== "") {
      if (parseFloat(obj.amountFilter) > eventObj.eventValue) {
        continue;
      }
    }
    // Filter name on from, to, caller
    if (obj.searchTerm !== "") {
      let isFiltered = true;
      if (eventObj.eventCaller.toLowerCase().includes(obj.searchTerm.toLowerCase())) isFiltered = false;
      if (eventObj.eventFrom.toLowerCase().includes(obj.searchTerm.toLowerCase())) isFiltered = false;
      if (eventObj.eventTo.toLowerCase().includes(obj.searchTerm.toLowerCase())) isFiltered = false;
      if (isFiltered) continue;
    }
    // Filter Events on filter buttons
    let isFiltered = true;
    // Check boolean filters on eventObj.eventType
    let count = 0;
    if (filterActivated) {
      if (eventObj.eventType === "Activate") {
        isFiltered = false;
      }
      count++;
    }
    if (rewardActivated) {
      if (eventObj.eventType === "Reward") {
        isFiltered = false;
      }
      count++;
    }
    if (updateActivated) {
      if (eventObj.eventType === "Update") {
        isFiltered = false;
      }
      count++;
    }
    if (withdrawActivated) {
      if (eventObj.eventType === "Withdraw") {
        isFiltered = false;
      }
      count++;
    }
    if (stakeActivated) {
      if (eventObj.eventType === "Stake") {
        isFiltered = false;
      }
      count++;
    }
    if (stakeActivated) {
      if (eventObj.eventType === "Migrate") {
        isFiltered = false;
      }
      count++;
    }
    if (unbondActivated) {
      if (eventObj.eventType === "Unbond") {
        isFiltered = false;
      }
      count++;
    }
    if (delegatorRewardActivated) {
      if (eventObj.eventType === "Claim") {
        isFiltered = false;
      }
      count++;
    }
    if (isFiltered && count) {
      continue;
    }

    if (unfiltered < obj.maxAmount) {
      unfiltered++;
      if (prevBlock === eventObj.transactionBlock) {
        eventList.push(<EventButton
          key={eventObj.transactionHash + unfiltered}
          eventObj={eventObj}
          setSearchTerm={obj.setSearchTerm}
        />);
      } else {
        prevBlock = eventObj.transactionBlock;
        eventList.push(<EventButton
          key={eventObj.transactionHash + unfiltered}
          eventObj={eventObj}
          isFirstOfBlock={prevBlock}
          time={eventObj.transactionTime}
          setSearchTerm={obj.setSearchTerm}
        />);
      }
    }
  }

  let filterBit;
  if (obj.showFilter) {
    filterBit = <div className="flexContainer roundedOpaque" style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0, borderBottomLeftRadius: 0, margin: 0, width: '100%' }}>
      <div className="strokeSmollLeft" style={{ margin: 0, padding: 0, flex: 1 }}>
        <div className="stroke" style={{ margin: "0", padding: 0 }}>
          <div className="strokeSmollLeft" style={{ margin: 0, padding: 0 }}>
            <h3>Showing max {obj.maxAmount} results</h3>
          </div>
          <div className="row" style={{ margin: 0, padding: 0 }}>
            <div className="strokeSmollLeft" style={{ margin: 0, padding: 0 }}>
              {showLessBlock}
            </div>
            <div className="strokeSmollLeft" style={{ margin: 0, padding: 0 }}>
              {showMoreBlock}
            </div>
          </div>
        </div>
      </div>
      <div className="strokeSmollLeft" style={{ margin: 0, padding: 0, flex: 2 }}>
        <div className="row" style={{ margin: 0, padding: 0 }}>
          {searchTermText}
        </div>
        <div className="row" style={{ margin: 0, padding: 0 }}>
          <input className="searchField" style={{ width: '80%', paddingLeft: '1em', paddingRight: '1em' }}
            value={obj.searchTerm}
            onChange={(evt) => obj.setSearchTerm(evt.target.value)}
            placeholder='Filter by Orchestrator address'
            type="text"
          />
          <div className="strokeSmollLeft" style={{ margin: 0, padding: 0 }}>
            <button className={"nonHomeButton"} style={{ backgroundColor: greyColour, margin: 0, padding: '0', width: '6em' }} onClick={() => {
              obj.setSearchTerm("");
            }}>
              <h3>Clear</h3>
            </button>
          </div>
        </div>
      </div>
      <div className="strokeSmollLeft" style={{ margin: 0, padding: 0, flex: 2 }}>
        <div className="row" style={{ margin: 0, padding: 0 }}>
          <h3>{parseFloat(obj.amountFilter) > 0 ? ("Only showing higher than " + obj.amountFilter) : "Filter by minimum value"}</h3>
        </div>
        <div className="row" style={{ margin: 0, padding: 0 }}>
          <div className="strokeSmollLeft" style={{ margin: 0, padding: 0 }}>
            <button className={"nonHomeButton"} style={{ backgroundColor: greyColour, margin: 0, padding: '0', width: '5em' }} onClick={() => {
              obj.setAmountFilter(0);
            }}>
              <h3>0</h3>
            </button>
          </div>
          <input className="searchField" style={{ margin: 0, padding: 0, height: '2em', width: '80%', paddingLeft: '1em', paddingRight: '1em' }}
            value={obj.amountFilter}
            onChange={(evt) => obj.setAmountFilter(evt.target.value)}
            placeholder='Filter by minimum value'
            type="number"
          />
          <div className="strokeSmollLeft" style={{ margin: 0, padding: 0 }}>
            <button className={"nonHomeButton"} style={{ backgroundColor: greyColour, margin: 0, padding: '0', width: '4em' }} onClick={() => {
              const curVal = parseFloat(obj.amountFilter);
              obj.setAmountFilter(curVal + 100);
            }}>
              <h3>+100</h3>
            </button>
          </div>
          <div className="strokeSmollLeft" style={{ margin: 0, padding: 0 }}>
            <button className={"nonHomeButton"} style={{ backgroundColor: greyColour, margin: 0, padding: '0', width: '5em' }} onClick={() => {
              const curVal = parseFloat(obj.amountFilter);
              obj.setAmountFilter(curVal + 1000);
            }}>
              <h3>+1000</h3>
            </button>
          </div>
        </div>
      </div>
    </div>
  }

  return (
    <div className="strokeSmollLeft" style={{ padding: 0, margin: 0, height: 'calc( 100vh - 50px)' }}>
      {filterBit}
      <div className="row" style={{ padding: 0, margin: 0, width: '100%', height: '100%' }}>
        <div className="stroke roundedOpaque" style={{ padding: 0, margin: 0, width: 'unset', height: '100%', marginRight: '1em', overflow: 'hidden', marginTop: '1em', overflowX: 'scroll' }}>
          <div className="content-wrapper" style={{ width: '100%' }}>
            <ScrollContainer className="overflow-container" hideScrollbars={false}>
              <div className="overflow-content" style={{ cursor: 'grab', paddingTop: 0 }}>
                <div className={obj.forceVertical ? "flexContainer forceWrap" : "flexContainer"} style={{ margin: 0, textAlign: 'center', alignItems: 'center', justifyContent: 'center' }}>
                  {eventList}
                </div>
              </div>
            </ScrollContainer>
            <div className="strokeSmollLeft" style={{ marginRight: "1em" }}>
              <button className={filterActivated ? "row nonHomeButton active" : "row nonHomeButton"} style={{ backgroundColor: filterActivatedColour }} onClick={() => {
                setFilterActivated(!filterActivated);
              }}>
                <h3>Activated</h3>
              </button>
              <button className={rewardActivated ? "row nonHomeButton active" : "row nonHomeButton"} style={{ backgroundColor: rewardActivatedColour }} onClick={() => {
                setRewardActivated(!rewardActivated);
              }}>
                <h3>Reward</h3>
              </button>
              <button className={updateActivated ? "row nonHomeButton active" : "row nonHomeButton"} style={{ backgroundColor: updateActivatedColour }} onClick={() => {
                setUpdateActivated(!updateActivated);
              }}>
                <h3>Update</h3>
              </button>
              <button className={withdrawActivated ? "row nonHomeButton active" : "row nonHomeButton"} style={{ backgroundColor: withdrawActivatedColour }} onClick={() => {
                setWithdrawActivated(!withdrawActivated);
              }}>
                <h3>Withdraw</h3>
              </button>
              <button className={stakeActivated ? "row nonHomeButton active" : "row nonHomeButton"} style={{ backgroundColor: stakeActivatedColour }} onClick={() => {
                setStakeActivated(!stakeActivated);
              }}>
                <h3>Stake</h3>
              </button>
              <button className={delegatorRewardActivated ? "row nonHomeButton active" : "row nonHomeButton"} style={{ backgroundColor: delegatorActivatedColour }} onClick={() => {
                setDelegatorRewardActivated(!delegatorRewardActivated);
              }}>
                <h3>Claim</h3>
              </button>
              <button className={unbondActivated ? "row nonHomeButton active" : "row nonHomeButton"} style={{ backgroundColor: unbondActivatedColour }} onClick={() => {
                setUnbondActivated(!unbondActivated);
              }}>
                <h3>Unbond</h3>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventViewer;