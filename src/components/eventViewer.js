import React, { useState, useRef } from "react";
import EventButton from "./eventButton";
import ScrollContainer from 'react-indiana-drag-scroll';
import Filter from './filterComponent';
import ReactPaginate from 'react-paginate';
/// A scrollable and filterable list of EventButtons

const activationColour = "rgba(23, 60, 122, 0.3)";
const rewardColour = "rgba(20, 99, 29, 0.3)";
const updateColour = "rgba(122, 63, 23, 0.3)";
const withdrawStakeColour = "rgba(115, 110, 22, 0.3)";
const stakeColour = "rgba(71, 23, 122, 0.3)";
const claimColour = "rgba(77, 91, 42, 0.3)";
const unbondColour = "rgba(122, 23, 51, 0.3)";
const ticketRedeemColour = "rgba(42, 44, 91, 0.3)";
const greyColour = "rgba(122, 128, 127, 0.3)";

const defaultIncrementMaxShown = 100;

const EventViewer = (obj) => {
  const listInnerRef = useRef();
  const [filterActivated, setFilterActivated] = useState(true);
  const [rewardActivated, setRewardActivated] = useState(true);
  const [updateActivated, setUpdateActivated] = useState(true);
  const [withdrawActivated, setWithdrawActivated] = useState(true);
  const [stakeActivated, setStakeActivated] = useState(true);
  const [delegatorRewardActivated, setDelegatorRewardActivated] = useState(true);
  const [ticketRedemptionActivated, setTicketRedemptionActivated] = useState(true);
  const [unbondActivated, setUnbondActivated] = useState(true);
  console.log("Rendering EventViewer");
  let unfiltered = 0;
  let filtered = 0;
  let hidden = 0;
  let prevBlock = 0;
  let limitShown = obj.events.length + obj.tickets.length;

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
  let ticketActivatedColour;
  ticketActivatedColour = ticketRedemptionActivated ? ticketRedeemColour : greyColour;
  let unbondActivatedColour;
  unbondActivatedColour = unbondActivated ? unbondColour : greyColour;

  const updateOnScroll = () => {
    if (unfiltered == 0) {
      return;
    }
    if (listInnerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = listInnerRef.current.container.current;
      if (scrollTop + clientHeight === scrollHeight) {
        obj.setMaxAmount(obj.maxAmount + defaultIncrementMaxShown);
      }
    }
  }

  let eventList = [];
  let thisEvent = {};
  let eventIdx = obj.events.length - 1;
  let ticketIdx = obj.tickets.length - 1;
  while (eventIdx >= 0 || ticketIdx >= 0) {
    const latestEvent = obj.events[eventIdx];
    let latestEventTime = 0;
    if (eventIdx >= 0) {
      latestEventTime = latestEvent.transactionTime;
    }
    const latestTicket = obj.tickets[ticketIdx];
    let latestTicketTime = 0;
    if (ticketIdx >= 0) {
      latestTicketTime = latestTicket.transactionTime;
    }
    if (latestEventTime > latestTicketTime) {
      thisEvent = latestEvent;
      eventIdx -= 1;
    } else if (latestTicketTime) {
      thisEvent = latestTicket;
      ticketIdx -= 1;
    } else {
      console.log("error, breaky breaky");
      break;
    }
    // Filter by minimum value
    if (obj.amountFilter !== "") {
      if (parseFloat(obj.amountFilter) > thisEvent.eventValue) {
        filtered++;
        continue;
      }
    }
    // Filter name on from, to, caller
    if (obj.searchTerm !== "") {
      let isFiltered = true;
      if (thisEvent.eventCaller.toLowerCase().includes(obj.searchTerm.toLowerCase())) isFiltered = false;
      if (thisEvent.eventFrom.toLowerCase().includes(obj.searchTerm.toLowerCase())) isFiltered = false;
      if (thisEvent.eventTo.toLowerCase().includes(obj.searchTerm.toLowerCase())) isFiltered = false;
      if (isFiltered) {
        filtered++;
        continue;
      }
    }
    // Filter Events on filter buttons
    let isFiltered = true;
    // Check boolean filters on thisEvent.eventType
    let count = 0;
    if (filterActivated) {
      if (thisEvent.eventType === "Activate") {
        isFiltered = false;
      }
      count++;
    }
    if (rewardActivated) {
      if (thisEvent.eventType === "Reward") {
        isFiltered = false;
      }
      count++;
    }
    if (updateActivated) {
      if (thisEvent.eventType === "Update") {
        isFiltered = false;
      }
      count++;
    }
    if (withdrawActivated) {
      if (thisEvent.eventType === "Withdraw") {
        isFiltered = false;
      }
      count++;
    }
    if (stakeActivated) {
      if (thisEvent.eventType === "Stake") {
        isFiltered = false;
      }
      count++;
    }
    if (stakeActivated) {
      if (thisEvent.eventType === "Migrate") {
        isFiltered = false;
      }
      count++;
    }
    if (unbondActivated) {
      if (thisEvent.eventType === "Unbond") {
        isFiltered = false;
      }
      count++;
    }
    if (delegatorRewardActivated) {
      if (thisEvent.eventType === "Claim") {
        isFiltered = false;
      }
      count++;
    }
    if (ticketRedemptionActivated) {
      if (thisEvent.eventType === "RedeemTicket") {
        isFiltered = false;
      }
      count++;
    }
    if (isFiltered && count) {
      filtered++;
      continue;
    }

    if (unfiltered < obj.maxAmount) {
      unfiltered++;
      if (prevBlock === thisEvent.transactionBlock) {
        eventList.push(<EventButton
          key={thisEvent.transactionHash + unfiltered}
          eventObj={thisEvent}
          setSearchTerm={obj.setSearchTerm}
        />);
      } else {
        prevBlock = thisEvent.transactionBlock;
        eventList.push(<EventButton
          key={thisEvent.transactionHash + unfiltered}
          eventObj={thisEvent}
          isFirstOfBlock={prevBlock}
          time={thisEvent.transactionTime}
          setSearchTerm={obj.setSearchTerm}
        />);
      }
    }
    else {
      hidden++;
    }
  }

  let showMoreButton;
  if (hidden == 0) {
    showMoreButton =
      <div className="stroke" style={{ width: '100%', padding: 0, margin: 0, marginBottom: '2em', marginTop: '2em' }}>
        <div className="strokeSmollLeft" style={{ borderRadius: "1.2em", backgroundColor: greyColour, padding: 0, margin: 0, width: '100%' }}>
          <p className="row withWrap" style={{ maxWidth: '600px' }}>
            ☑️ Reached end of results
          </p>
        </div>
      </div>
  } else {
    showMoreButton =
      <div className="stroke" style={{ width: '100%', padding: 0, margin: 0, marginBottom: '2em', marginTop: '2em' }}>
        <div className="strokeSmollLeft" style={{ borderRadius: "1.2em", padding: 0, margin: 0, width: '100%' }}>
          <button className="row nonHomeButton" style={{ backgroundColor: greyColour }} onClick={() => {
            obj.setMaxAmount(obj.maxAmount + defaultIncrementMaxShown);
          }}>
            <h3>🔄 Show More</h3>
          </button>
        </div>
      </div>
  }

  let filterBit;
  if (obj.showFilter) {
    filterBit =
      <div className="strokeSmollLeft roundedOpaque" style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0, borderBottomLeftRadius: 0, margin: 0, width: '100%' }}>
        <div className="row">
          <span>Showing {hidden + unfiltered} out of {limitShown} results</span>
        </div>
        <Filter amountFilter={obj.amountFilter} setAmountFilter={obj.setAmountFilter}
          searchTerm={obj.searchTerm} setSearchTerm={obj.setSearchTerm} />
      </div>
  }

  return (
    <div className="strokeSmollLeft" style={{ padding: 0, margin: 0, height: 'calc( 100vh - 50px)' }}>
      {filterBit}
      <div className="row" style={{ padding: 0, margin: 0, width: '100%', height: '100%' }}>
        <div className="stroke roundedOpaque" style={{ padding: 0, margin: 0, width: 'unset', height: '100%', marginRight: '1em', overflow: 'hidden', marginTop: '1em', overflowX: 'scroll' }}>
          <div className="content-wrapper" style={{ width: '100%' }}>
            <ScrollContainer activationDistance={1} className="overflow-container"
              hideScrollbars={false} onEndScroll={updateOnScroll} ref={listInnerRef}>
              <div className="overflow-content" style={{ cursor: 'grab', paddingTop: 0 }}>
                <div className={obj.forceVertical ? "flexContainer forceWrap" : "flexContainer"} style={{ margin: 0, textAlign: 'center', alignItems: 'center', justifyContent: 'center' }}>
                  {eventList}
                  {showMoreButton}
                </div>
              </div>
            </ScrollContainer>
            <div className="strokeSmollLeft" style={{ marginRight: "1em" }}>
              <button className={filterActivated ? "row nonHomeButton active" : "row nonHomeButton"} style={{ backgroundColor: filterActivatedColour, marginTop: '0.7em' }} onClick={() => {
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
              <button className={ticketRedemptionActivated ? "row nonHomeButton active" : "row nonHomeButton"} style={{ backgroundColor: ticketActivatedColour }} onClick={() => {
                setTicketRedemptionActivated(!ticketRedemptionActivated);
              }}>
                <h3>Tickets</h3>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventViewer;