import React, { useState, useRef } from "react";
import EventButton from "./eventButton";
import ScrollContainer from 'react-indiana-drag-scroll';
import Filter from './filterComponent';

const thresholdStaking = 0.001;
const thresholdFees = 0.00009;

const claimColour = "rgba(25, 158, 29, 0.4)";
const stakeColour = "rgba(25, 158, 147, 0.4)";
const ticketRedeemColour = "rgba(25, 98, 158, 0.4)";
const rewardColour = "rgba(25, 27, 158, 0.4)";
const unbondColour = "rgba(105, 25, 158, 0.4)";
const updateColour = "rgba(158, 25, 52, 0.4)";
const withdrawStakeColour = "rgba(158, 98, 25, 0.4)";
const activationColour = "rgba(154, 158, 25, 0.4)";
const ticketTransferColour = "rgba(88, 91, 42, 0.3)";
const greyColour = "rgba(122, 128, 127, 0.4)";

const defaultIncrementMaxShown = 50;

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
  let updateEventsIdx = obj.updateEvents.length - 1;
  let rewardEventsIdx = obj.rewardEvents.length - 1;
  let claimEventsIdx = obj.claimEvents.length - 1;
  let withdrawStakeEventsIdx = obj.withdrawStakeEvents.length - 1;
  let withdrawFeesEventsIdx = obj.withdrawFeesEvents.length - 1;
  let activateEventsIdx = obj.activateEvents.length - 1;
  let stakeEventsIdx = obj.stakeEvents.length - 1;
  let unbondEventsIdx = obj.unbondEvents.length - 1;
  let transferTicketEventsIdx = obj.transferTicketEvents.length - 1;
  let redeemTicketEventsIdx = obj.redeemTicketEvents.length - 1;

  if (!filterActivated) {
    filtered += activateEventsIdx + 1;
    activateEventsIdx = -1;
  }
  if (!rewardActivated) {
    filtered += rewardEventsIdx + 1;
    rewardEventsIdx = -1;
  }
  if (!updateActivated) {
    filtered += updateEventsIdx + 1;
    updateEventsIdx = -1;
  }
  if (!withdrawActivated) {
    filtered += withdrawStakeEventsIdx + 1;
    filtered += withdrawFeesEventsIdx + 1;
    withdrawStakeEventsIdx = -1;
    withdrawFeesEventsIdx = -1;
  }
  if (!stakeActivated) {
    filtered += stakeEventsIdx + 1;
    stakeEventsIdx = -1;
  }
  if (!unbondActivated) {
    filtered += unbondEventsIdx + 1;
    unbondEventsIdx = -1;
  }
  if (!delegatorRewardActivated) {
    filtered += rewardEventsIdx + 1;
    rewardEventsIdx = -1;
  }
  if (!rewardActivated) {
    filtered += claimEventsIdx + 1;
    claimEventsIdx = -1;
  }
  if (!ticketRedemptionActivated) {
    filtered += transferTicketEventsIdx + 1;
    filtered += redeemTicketEventsIdx + 1;
    transferTicketEventsIdx = -1;
    redeemTicketEventsIdx = -1;
  }


  while (updateEventsIdx >= 0 ||
    rewardEventsIdx >= 0 ||
    claimEventsIdx >= 0 ||
    withdrawStakeEventsIdx >= 0 ||
    withdrawFeesEventsIdx >= 0 ||
    transferTicketEventsIdx >= 0 ||
    redeemTicketEventsIdx >= 0 ||
    activateEventsIdx >= 0 ||
    unbondEventsIdx >= 0 ||
    stakeEventsIdx >= 0) {

    let latestTime = 0;
    let thisEvent;
    let latestType;

    // Find latest event of enabled lists
    if (updateEventsIdx >= 0) {
      const thisObj = obj.updateEvents[updateEventsIdx];
      if (thisObj.blockTime > latestTime) {
        latestTime = thisObj.blockTime;
        thisEvent = thisObj;
        latestType = "update"
      }
    }
    if (rewardEventsIdx >= 0) {
      const thisObj = obj.rewardEvents[rewardEventsIdx];
      if (thisObj.blockTime > latestTime) {
        latestTime = thisObj.blockTime;
        thisEvent = thisObj;
        latestType = "reward"
      }
    }
    if (claimEventsIdx >= 0) {
      const thisObj = obj.claimEvents[claimEventsIdx];
      if (thisObj.blockTime > latestTime) {
        latestTime = thisObj.blockTime;
        thisEvent = thisObj;
        latestType = "claim"
      }
    }
    if (withdrawStakeEventsIdx >= 0) {
      const thisObj = obj.withdrawStakeEvents[withdrawStakeEventsIdx];
      if (thisObj.blockTime > latestTime) {
        latestTime = thisObj.blockTime;
        thisEvent = thisObj;
        latestType = "withdrawStake"
      }
    }
    if (withdrawFeesEventsIdx >= 0) {
      const thisObj = obj.withdrawFeesEvents[withdrawFeesEventsIdx];
      if (thisObj.blockTime > latestTime) {
        latestTime = thisObj.blockTime;
        thisEvent = thisObj;
        latestType = "withdrawFees"
      }
    }
    if (activateEventsIdx >= 0) {
      const thisObj = obj.activateEvents[activateEventsIdx];
      if (thisObj.blockTime > latestTime) {
        latestTime = thisObj.blockTime;
        thisEvent = thisObj;
        latestType = "activate"
      }
    }
    if (updateEventsIdx >= 0) {
      const thisObj = obj.updateEvents[updateEventsIdx];
      if (thisObj.blockTime > latestTime) {
        latestTime = thisObj.blockTime;
        thisEvent = thisObj;
        latestType = "update"
      }
    }
    if (stakeEventsIdx >= 0) {
      const thisObj = obj.stakeEvents[stakeEventsIdx];
      if (thisObj.blockTime > latestTime) {
        latestTime = thisObj.blockTime;
        thisEvent = thisObj;
        latestType = "stake"
      }
    }
    if (unbondEventsIdx >= 0) {
      const thisObj = obj.unbondEvents[unbondEventsIdx];
      if (thisObj.blockTime > latestTime) {
        latestTime = thisObj.blockTime;
        thisEvent = thisObj;
        latestType = "unbond"
      }
    }
    if (transferTicketEventsIdx >= 0) {
      const thisObj = obj.transferTicketEvents[transferTicketEventsIdx];
      if (thisObj.blockTime > latestTime) {
        latestTime = thisObj.blockTime;
        thisEvent = thisObj;
        latestType = "transferTicket"
      }
    }
    if (redeemTicketEventsIdx >= 0) {
      const thisObj = obj.redeemTicketEvents[redeemTicketEventsIdx];
      if (thisObj.blockTime > latestTime) {
        latestTime = thisObj.blockTime;
        thisEvent = thisObj;
        latestType = "redeemTicket"
      }
    }

    // Decrement IDX and check filter
    if (latestType == "update") {
      updateEventsIdx--;
      // Filter name on from, to, caller
      if (obj.searchTerm !== "") {
        let isFiltered = true;
        if (thisEvent.address.toLowerCase().includes(obj.searchTerm.toLowerCase())) isFiltered = false;
        if (isFiltered) {
          filtered++;
          continue;
        }
      }
    } else if (latestType == "reward") {
      rewardEventsIdx--;
      // Filter by minimum value
      if (obj.amountFilter !== "") {
        if (parseFloat(obj.amountFilter) > thisEvent.amount) {
          filtered++;
          continue;
        }
      }
      // Filter name on from, to, caller
      if (obj.searchTerm !== "") {
        let isFiltered = true;
        if (thisEvent.address.toLowerCase().includes(obj.searchTerm.toLowerCase())) isFiltered = false;
        if (isFiltered) {
          filtered++;
          continue;
        }
      }
    } else if (latestType == "claim") {
      claimEventsIdx--;
      // Filter by minimum value
      if (obj.amountFilter !== "") {
        if (parseFloat(obj.amountFilter) > thisEvent.fees ||
          parseFloat(obj.amountFilter) > thisEvent.rewards) {
          filtered++;
          continue;
        }
      }
      // Filter name on from, to, caller
      if (obj.searchTerm !== "") {
        let isFiltered = true;
        if (thisEvent.address.toLowerCase().includes(obj.searchTerm.toLowerCase())) isFiltered = false;
        if (isFiltered) {
          filtered++;
          continue;
        }
      }
    } else if (latestType == "withdrawStake") {
      withdrawStakeEventsIdx--;
      // Filter by minimum value
      if (obj.amountFilter !== "") {
        if (parseFloat(obj.amountFilter) > thisEvent.amount) {
          filtered++;
          continue;
        }
      }
      // Filter name on from, to, caller
      if (obj.searchTerm !== "") {
        let isFiltered = true;
        if (thisEvent.address.toLowerCase().includes(obj.searchTerm.toLowerCase())) isFiltered = false;
        if (isFiltered) {
          filtered++;
          continue;
        }
      }
    } else if (latestType == "withdrawFees") {
      withdrawFeesEventsIdx--;
      // Filter by minimum value
      if (obj.amountFilter !== "") {
        if (parseFloat(obj.amountFilter) > thisEvent.amount) {
          filtered++;
          continue;
        }
      }
      // Filter name on from, to, caller
      if (obj.searchTerm !== "") {
        let isFiltered = true;
        if (thisEvent.address.toLowerCase().includes(obj.searchTerm.toLowerCase())) isFiltered = false;
        if (isFiltered) {
          filtered++;
          continue;
        }
      }
    } else if (latestType == "activate") {
      activateEventsIdx--;
      // Filter by minimum value
      if (obj.amountFilter !== "") {
        if (parseFloat(obj.amountFilter) > thisEvent.initialStake) {
          filtered++;
          continue;
        }
      }
      // Filter name on from, to, caller
      if (obj.searchTerm !== "") {
        let isFiltered = true;
        if (thisEvent.address.toLowerCase().includes(obj.searchTerm.toLowerCase())) isFiltered = false;
        if (isFiltered) {
          filtered++;
          continue;
        }
      }
    } else if (latestType == "update") {
      updateEventsIdx--;
      // Filter by minimum value
      if (obj.amountFilter !== "") {
        if (parseFloat(obj.amountFilter) > thisEvent.amount) {
          filtered++;
          continue;
        }
      }
      // Filter name on from, to, caller
      if (obj.searchTerm !== "") {
        let isFiltered = true;
        if (thisEvent.address.toLowerCase().includes(obj.searchTerm.toLowerCase())) isFiltered = false;
        if (isFiltered) {
          filtered++;
          continue;
        }
      }
    } else if (latestType == "stake") {
      stakeEventsIdx--;
      // Filter by minimum value
      if (obj.amountFilter !== "") {
        if (parseFloat(obj.amountFilter) > thisEvent.stake) {
          filtered++;
          continue;
        }
      }
      // Filter name on from, to, caller
      if (obj.searchTerm !== "") {
        let isFiltered = true;
        if (thisEvent.address.toLowerCase().includes(obj.searchTerm.toLowerCase())) isFiltered = false;
        if (thisEvent.from && thisEvent.from.toLowerCase().includes(obj.searchTerm.toLowerCase())) isFiltered = false;
        if (thisEvent.to.toLowerCase().includes(obj.searchTerm.toLowerCase())) isFiltered = false;
        if (isFiltered) {
          filtered++;
          continue;
        }
      }
    } else if (latestType == "unbond") {
      unbondEventsIdx--;
      // Filter by minimum value
      if (obj.amountFilter !== "") {
        if (parseFloat(obj.amountFilter) > thisEvent.stake) {
          filtered++;
          continue;
        }
      }
      // Filter name on from, to, caller
      if (obj.searchTerm !== "") {
        let isFiltered = true;
        if (thisEvent.address.toLowerCase().includes(obj.searchTerm.toLowerCase())) isFiltered = false;
        if (thisEvent.from.toLowerCase().includes(obj.searchTerm.toLowerCase())) isFiltered = false;
        if (isFiltered) {
          filtered++;
          continue;
        }
      }
    } else if (latestType == "transferTicket") {
      transferTicketEventsIdx--;
      // Filter by minimum value
      if (obj.amountFilter !== "") {
        if (parseFloat(obj.amountFilter) > thisEvent.amount) {
          filtered++;
          continue;
        }
      }
      // Filter name on from, to, caller
      if (obj.searchTerm !== "") {
        let isFiltered = true;
        if (thisEvent.address.toLowerCase().includes(obj.searchTerm.toLowerCase())) isFiltered = false;
        if (thisEvent.to.toLowerCase().includes(obj.searchTerm.toLowerCase())) isFiltered = false;
        if (isFiltered) {
          filtered++;
          continue;
        }
      }
    } else if (latestType == "redeemTicket") {
      redeemTicketEventsIdx--;
      // Filter by minimum value
      if (obj.amountFilter !== "") {
        if (parseFloat(obj.amountFilter) > thisEvent.amount) {
          filtered++;
          continue;
        }
      }
      // Filter name on from, to, caller
      if (obj.searchTerm !== "") {
        let isFiltered = true;
        if (thisEvent.address.toLowerCase().includes(obj.searchTerm.toLowerCase())) isFiltered = false;
        if (isFiltered) {
          filtered++;
          continue;
        }
      }
    } else {
      console.log("bork");
    }


    if (unfiltered < obj.maxAmount) {
      unfiltered++;
      if (prevBlock === thisEvent.transactionBlock) {
        eventList.push(<EventButton
          key={thisEvent.transactionHash + unfiltered}
          seed={thisEvent.transactionHash + unfiltered}
          eventObj={thisEvent}
          type={latestType}
          setSearchTerm={obj.setSearchTerm}
        />);
      } else {
        prevBlock = thisEvent.transactionBlock;
        eventList.push(<EventButton
          key={thisEvent.transactionHash + unfiltered}
          seed={thisEvent.transactionHash + unfiltered}
          eventObj={thisEvent}
          type={latestType}
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
      <div className="row">
        <div className="strokeSmollLeft" style={{ width: '100%' }}>
          <p className="row buttonPadding" style={{ borderRadius: "1.2em", backgroundColor: greyColour, maxWidth: '600px' }}>
            ☑️ Reached end of results
          </p>
        </div>
      </div>
  } else {
    showMoreButton =
      <div className="row">
        <div className="strokeSmollLeft" style={{ width: '100%' }}>
          <button className="row nonHomeButton buttonPadding" style={{ borderRadius: "1.2em", backgroundColor: greyColour, maxWidth: '600px' }}
            onClick={() => {
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
      <div className="strokeSmollLeft roundedOpaque" style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0, borderBottomLeftRadius: 0, width: '100%' }}>
        <div className="row">
          <span>Showing {hidden + unfiltered} out of {limitShown} results</span>
        </div>
        <Filter amountFilter={obj.amountFilter} setAmountFilter={obj.setAmountFilter}
          searchTerm={obj.searchTerm} setSearchTerm={obj.setSearchTerm} />
      </div>
  }

  return (
    <div className="strokeSmollLeft" style={{ height: 'calc( 100vh - 50px)' }}>
      {filterBit}
      <div className="row" style={{ width: '100%', height: '100%' }}>
        <div className="stroke roundedOpaque onlyVerticalScroll" style={{ width: '40vw', minWidth: '400px', height: 'calc( 100vh - 50px - 2em)', marginTop: '2em' }}>
          <div className="content-wrapper" style={{ width: '100%' }}>
            <ScrollContainer activationDistance={1} className="overflow-container"
              hideScrollbars={false} onEndScroll={updateOnScroll} ref={listInnerRef}>
              <div className="overflow-content" style={{ cursor: 'grab', paddingTop: 0 }}>
                <div className={obj.forceVertical ? "flexContainer forceWrap" : "flexContainer"} >
                  {eventList}
                  <div className="verticalDivider" />
                  {showMoreButton}
                  <div className="verticalDivider" />
                </div>
              </div>
            </ScrollContainer>
            <div className="strokeSmollLeft sideMargin">
              <div className="verticalDivider" />
              <button className={delegatorRewardActivated ? "row nonHomeButton buttonPadding active" : "row nonHomeButton buttonPadding"} style={{ backgroundColor: delegatorActivatedColour }} onClick={() => {
                setDelegatorRewardActivated(!delegatorRewardActivated);
              }}>
                <h3>Claim</h3>
              </button>
              <button className={stakeActivated ? "row nonHomeButton buttonPadding active" : "row nonHomeButton buttonPadding"} style={{ backgroundColor: stakeActivatedColour }} onClick={() => {
                setStakeActivated(!stakeActivated);
              }}>
                <h3>Stake</h3>
              </button>
              <button className={ticketRedemptionActivated ? "row nonHomeButton buttonPadding active" : "row nonHomeButton buttonPadding"} style={{ backgroundColor: ticketActivatedColour }} onClick={() => {
                setTicketRedemptionActivated(!ticketRedemptionActivated);
              }}>
                <h3>Tickets</h3>
              </button>
              <button className={rewardActivated ? "row nonHomeButton buttonPadding active" : "row nonHomeButton buttonPadding"} style={{ backgroundColor: rewardActivatedColour }} onClick={() => {
                setRewardActivated(!rewardActivated);
              }}>
                <h3>Reward</h3>
              </button>
              <button className={unbondActivated ? "row nonHomeButton buttonPadding active" : "row nonHomeButton buttonPadding"} style={{ backgroundColor: unbondActivatedColour }} onClick={() => {
                setUnbondActivated(!unbondActivated);
              }}>
                <h3>Unbond</h3>
              </button>
              <button className={updateActivated ? "row nonHomeButton buttonPadding active" : "row nonHomeButton buttonPadding"} style={{ backgroundColor: updateActivatedColour }} onClick={() => {
                setUpdateActivated(!updateActivated);
              }}>
                <h3>Update</h3>
              </button>
              <button className={withdrawActivated ? "row nonHomeButton buttonPadding active" : "row nonHomeButton buttonPadding"} style={{ backgroundColor: withdrawActivatedColour }} onClick={() => {
                setWithdrawActivated(!withdrawActivated);
              }}>
                <h3>Withdraw</h3>
              </button>
              <button className={filterActivated ? "row nonHomeButton buttonPadding active" : "row nonHomeButton buttonPadding"} style={{ backgroundColor: filterActivatedColour }} onClick={() => {
                setFilterActivated(!filterActivated);
              }}>
                <h3>Activated</h3>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventViewer;