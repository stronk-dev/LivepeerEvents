import React, { useState } from "react";
import EventButton from "./eventButton";
import ScrollContainer from 'react-indiana-drag-scroll';

const activationColour = "rgba(23, 60, 122, 0.3)";
const rewardColour = "rgba(20, 99, 29, 0.3)";
const updateColour = "rgba(122, 63, 23, 0.3)";
const withdrawStakeColour = "rgba(102, 3, 10, 0.3)";
const stakeColour = "rgba(71, 23, 122, 0.3)";

const EventViewer = (obj) => {
  const [searchTerm, setSearchTerm] = useState(obj.prefill || "");
  const [filterActivated, setFilterActivated] = useState(false);
  const [rewardActivated, setRewardActivated] = useState(false);
  const [updateActivated, setUpdateActivated] = useState(false);
  const [withdrawActivated, setWithdrawActivated] = useState(false);
  const [stakeActivated, setStakeActivated] = useState(false);

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
      <div className="fixed-container" style={{ padding: 0, width: '300px'}}>
        <input className="searchField" style={{ width: '300px' }}
          value={searchTerm}
          onChange={(evt) => setSearchTerm(evt.target.value)}
          placeholder='Filter by Orchestrator address'
          type="text"
        />
      </div>
      <div className="content-wrapper" style={{ alignItems: 'stretch', width: '100%' }}>
        <ScrollContainer className="overflow-container" hideScrollbars={false}>
          <div className="overflow-content" style={{ cursor: 'grab', paddingTop: 0 }}>
            {obj.events.slice(0).reverse().map((eventObj, idx) => {
              // Filter
              if (eventObj.name === "WithdrawFees" || eventObj.name === "TransferBond"
                || eventObj.name === "Rebond" || eventObj.name === "Unbond" || eventObj.name === "EarningsClaimed") {
                console.log("Skipping event" + eventObj);
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
              if (eventBundle.length) {
                return <EventButton
                  key={eventObj.transactionHash + idx}
                  transactionUrl={finalUrl}
                  transactionHash={finalHash}
                  events={eventBundle}
                  idx={finalIdx}
                  searchTerm={searchTerm}
                  filterActivated={filterActivated}
                  rewardActivated={rewardActivated}
                  updateActivated={updateActivated}
                  withdrawActivated={withdrawActivated}
                  stakeActivated={stakeActivated}
                />
              }
            })}
          </div>
        </ScrollContainer>
        <div className="strokeSmollLeft" style={{ marginRight: "1em" }}>
          <button className={filterActivated ? "row homeButton active" : "row homeButton"} style={{ backgroundColor: activationColour }} onClick={() => {
            setFilterActivated(!filterActivated);
          }}>
            <h3>Activated</h3>
          </button>
          <button className={rewardActivated ? "row homeButton active" : "row homeButton"} style={{ backgroundColor: rewardColour }} onClick={() => {
            setRewardActivated(!rewardActivated);
          }}>
            <h3>Reward</h3>
          </button>
          <button className={updateActivated ? "row homeButton active" : "row homeButton"} style={{ backgroundColor: updateColour }} onClick={() => {
            setUpdateActivated(!updateActivated);
          }}>
            <h3>Update</h3>
          </button>
          <button className={withdrawActivated ? "row homeButton active" : "row homeButton"} style={{ backgroundColor: withdrawStakeColour }} onClick={() => {
            setWithdrawActivated(!withdrawActivated);
          }}>
            <h3>Withdraw</h3>
          </button>
          <button className={stakeActivated ? "row homeButton active" : "row homeButton"} style={{ backgroundColor: stakeColour }} onClick={() => {
            setStakeActivated(!stakeActivated);
          }}>
            <h3>Stake</h3>
          </button>
        </div>
      </div>
    </div>
  )
}

export default EventViewer;