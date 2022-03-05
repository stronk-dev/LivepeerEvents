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
const maxShown = 500;

const EventViewer = (obj) => {
  const [searchTerm, setSearchTerm] = useState(obj.prefill || "");
  const [amountFilter, setAmountFilter] = useState("0");
  const [filterActivated, setFilterActivated] = useState(true);
  const [rewardActivated, setRewardActivated] = useState(false);
  const [updateActivated, setUpdateActivated] = useState(true);
  const [withdrawActivated, setWithdrawActivated] = useState(false);
  const [stakeActivated, setStakeActivated] = useState(true);
  const [delegatorRewardActivated, setDelegatorRewardActivated] = useState(false);
  const [unbondActivated, setUnbondActivated] = useState(true);
  console.log("Rendering EventViewer");
  let unfiltered = 0;

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

  return (
    <div className="stroke roundedOpaque" style={{ padding: 0, margin: 0, marginTop: '2em', position: 'absolute', bottom: 0, top: '300px', left: '0px', right: '0px', overflowY: 'auto', overflowX: 'hidden', width: '100%' }}>
      <div className="row">
        <div className="row">
          <h4>Shows the latest {maxShown} entries of your search query</h4>
        </div>
        <div className="row">
          <div className="stroke" style={{ margin: "0", padding: 0 }}>
            <h3>Filter by Orchestrator address</h3>
            <input className="searchField" style={{ width: '100%' }}
              value={searchTerm}
              onChange={(evt) => setSearchTerm(evt.target.value)}
              placeholder='Filter by Orchestrator address'
              type="text"
            />
          </div>
        </div>
        <div className="row">
          <div className="strokeSmollLeft" style={{ margin: 0, padding: 0 }}>
            <h3></h3>
            <button className={"nonHomeButton"} style={{ backgroundColor: greyColour, margin: 0, padding: '0', width: '5em' }} onClick={() => {
              const curVal = parseFloat(amountFilter);
              setAmountFilter(curVal - 1000);
            }}>
              <h3>-1000</h3>
            </button>
          </div>
          <div className="strokeSmollLeft" style={{ margin: 0, padding: 0 }}>
            <h3></h3>
            <button className={"nonHomeButton"} style={{ backgroundColor: greyColour, margin: 0, padding: '0', width: '4em' }} onClick={() => {
              const curVal = parseFloat(amountFilter);
              setAmountFilter(curVal - 100);
            }}>
              <h3>-100</h3>
            </button>
          </div>
          <div className="strokeSmollLeft" style={{ margin: 0, padding: 0 }}>
            <h3></h3>
            <button className={"nonHomeButton"} style={{ backgroundColor: greyColour, margin: 0, padding: '0', width: '3em' }} onClick={() => {
              const curVal = parseFloat(amountFilter);
              setAmountFilter(curVal - 10);
            }}>
              <h3>-10</h3>
            </button>
          </div>
          <div className="strokeSmollLeft" style={{ margin: "0", padding: 0 }}>
            <h3>Filter by minimum value</h3>
            <input className="searchField" style={{ margin: 0, padding: 0, height: '2em', width: '80%', paddingLeft: '1em', paddingRight: '1em' }}
              value={amountFilter}
              onChange={(evt) => setAmountFilter(evt.target.value)}
              placeholder='Filter by minimum value'
              type="number"
            />
          </div>
          <div className="strokeSmollLeft" style={{ margin: 0, padding: 0 }}>
            <h3></h3>
            <button className={"nonHomeButton"} style={{ backgroundColor: greyColour, margin: 0, padding: '0', width: '3em' }} onClick={() => {
              const curVal = parseFloat(amountFilter);
              setAmountFilter(curVal + 10);
            }}>
              <h3>+10</h3>
            </button>
          </div>
          <div className="strokeSmollLeft" style={{ margin: 0, padding: 0 }}>
            <h3></h3>
            <button className={"nonHomeButton"} style={{ backgroundColor: greyColour, margin: 0, padding: '0', width: '4em' }} onClick={() => {
              const curVal = parseFloat(amountFilter);
              setAmountFilter(curVal + 100);
            }}>
              <h3>+100</h3>
            </button>
          </div>
          <div className="strokeSmollLeft" style={{ margin: 0, padding: 0 }}>
            <h3></h3>
            <button className={"nonHomeButton"} style={{ backgroundColor: greyColour, margin: 0, padding: '0', width: '5em' }} onClick={() => {
              const curVal = parseFloat(amountFilter);
              setAmountFilter(curVal + 1000);
            }}>
              <h3>+1000</h3>
            </button>
          </div>
        </div>
      </div>
      <div className="content-wrapper" style={{ alignItems: 'stretch', width: '100%' }}>
        <ScrollContainer className="overflow-container" hideScrollbars={false}>
          <div className="overflow-content" style={{ cursor: 'grab', paddingTop: 0 }}>
            {obj.events.map((eventObj, idx) => {
              // Filter by minimum value
              if (amountFilter !== "") {
                if (parseFloat(amountFilter) > eventObj.eventValue) {
                  return null;
                }
              }
              // Filter name on from, to, caller
              if (searchTerm !== "") {
                let isFiltered = true;
                if (eventObj.eventCaller.toLowerCase().includes(searchTerm.toLowerCase())) isFiltered = false;
                if (eventObj.eventFrom.toLowerCase().includes(searchTerm.toLowerCase())) isFiltered = false;
                if (eventObj.eventTo.toLowerCase().includes(searchTerm.toLowerCase())) isFiltered = false;
                if (isFiltered) return null;
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
                return null;
              }

              if (unfiltered < maxShown) {
                unfiltered++;
                if (prevBlock === eventObj.transactionBlock) {
                  return <EventButton
                    key={eventObj.transactionHash + idx}
                    eventObj={eventObj}
                  />
                } else {
                  prevBlock = eventObj.transactionBlock;
                  return <EventButton
                    key={eventObj.transactionHash + idx}
                    eventObj={eventObj}
                    isFirstOfBlock={prevBlock}
                    time={eventObj.transactionTime}
                  />
                }
              }
            })}
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
  )
}

export default EventViewer;