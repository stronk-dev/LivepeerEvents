import React from 'react';
import Ticket from "../components/TicketViewer";

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

function updateClipboard(newClip) {
  navigator.clipboard.writeText(newClip).then(
    () => {
      console.log("Copied!");
    },
    () => {
      console.log("Copy failed!");
    }
  );
}

function copyLink(addr) {
  navigator.permissions
    .query({ name: "clipboard-write" })
    .then((result) => {
      if (result.state === "granted" || result.state === "prompt") {
        updateClipboard(addr);
      }
    });
}

const MonthlyFactoids = (obj) => {
  // Pies for stake overview, if have stake data for that month saved
  let totalStakeSum = 0;
  if (obj.data.latestTotalStake && obj.data.latestTotalStake.length) {
    let ticketIdx = obj.data.latestTotalStake.length - 1;
    // Calc total stake at that time
    while (ticketIdx >= 0) {
      const thisTicket = obj.data.latestTotalStake[ticketIdx];
      ticketIdx -= 1;
      totalStakeSum += thisTicket.totalStake;
    }
  }

  let summary = "";
  if (obj.data.reactivationCount) {
    summary += "🔌 " + obj.data.reactivationCount + " orchestrators reactivated \r\n";
  }
  if (obj.data.activationCount) {
    summary += "🔧 " + obj.data.activationCount + " orchestrators joined with an initial stake of " + obj.data.activationInitialSum.toLocaleString({ maximumFractionDigits: 2 }) + " LPT \r\n";
  }
  if (obj.data.latestCommission && obj.data.latestCommission.length) {
    summary += "🔗 " + obj.data.latestCommission.length + " orchestrators had a total of " + totalStakeSum.toLocaleString({ maximumFractionDigits: 2 }) + " LPT staked to them \r\n";
  }
  if (obj.data.bondCount) {
    summary += "📈 " + obj.data.bondCount + " accounts delegated for the first time for a total of " + obj.data.bondStakeSum.toLocaleString({ maximumFractionDigits: 2 }) + " LPT \r\n";
  }
  if (obj.data.unbondCount) {
    summary +="📉 " + obj.data.unbondCount + " delegators unbonded " + obj.data.unbondStakeSum.toLocaleString({ maximumFractionDigits: 2 }) + " LPT \r\n";
  }
  if (obj.data.rewardCount) {
    summary += "⌛ " + obj.data.rewardCount + " reward calls made were made by orchestrators worth " + obj.data.rewardAmountSum.toLocaleString({ maximumFractionDigits: 2 }) + " LPT \r\n";
  }
  if (obj.data.claimCount) {
    summary += "🏦 " + obj.data.claimRewardSum.toLocaleString({ maximumFractionDigits: 2 }) + " LPT and " + obj.data.claimFeeSum.toLocaleString({ maximumFractionDigits: 2 }) + " ETH worth of rewards were claimed by delegators \r\n";
  }
  if (obj.data.withdrawStakeCount) {
    summary += "💸 " + obj.data.withdrawStakeAmountSum.toLocaleString({ maximumFractionDigits: 2 }) + " LPT worth of staking rewards were withdrawn to the accounts of delegators \r\n";
  }
  if (obj.data.withdrawFeesCount) {
    summary += "💸 " + obj.data.withdrawFeesAmountSum.toLocaleString({ maximumFractionDigits: 2 }) + " ETH worth of transcoding fees were withdrawn to the accounts of delegators \r\n";
  }
  if (obj.data.moveStakeCount) {
    summary += "🔄 " + obj.data.moveStakeSum.toLocaleString({ maximumFractionDigits: 2 }) + " LPT worth of stake was moved directly between orchestrators in " + obj.data.moveStakeCount + " transactions \r\n";
  }
  if (obj.data.winningTicketsReceivedCount) {
    summary += "🎫 " + obj.data.winningTicketsReceivedCount + " winning tickets were sent out by " + obj.data.winningTicketsSent.length + " broadcasters \r\n";
  }
  if (obj.data.winningTicketsRedeemedCount) {
    summary += "🎟️ " + obj.data.winningTicketsRedeemedCount + " winning tickets were redeemed worth " + obj.data.winningTicketsRedeemedSum.toLocaleString({ maximumFractionDigits: 2 }) + " ETH \r\n";
  }

  return (
    <div className="stroke insetEffect" key={obj.seed + "factoids"}>
      <div className="overflow-content" style={{ width: "unset" }}>
        {obj.data.reactivationCount ?
          <div className="stroke" style={{ width: 'unset' }}>
            <div className="halfVerticalDivider" />
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'stretch', maxWidth: '61.8%', textAlign: 'justify', padding: '0.5em', backgroundColor: activationColour, border: '0.1em solid rgba(54, 46, 46, 0.1)' }}>
              <Ticket seed={obj.seed + "-reactivationCount-"} icon={"🔌"} subtext={obj.data.reactivationCount + " reactivations"} descriptions={[
                obj.data.reactivationCount + " Orchestrators reactivated"
              ]} />
            </div>
          </div> : null
        }

        {obj.data.activationCount ?
          <div className="stroke" style={{ width: 'unset' }}>
            <div className="halfVerticalDivider" />
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'stretch', maxWidth: '61.8%', textAlign: 'justify', padding: '0.5em', backgroundColor: activationColour, border: '0.1em solid rgba(54, 46, 46, 0.1)' }}>
              <Ticket seed={obj.seed + "-neworchs-"} icon={"🔧"} subtext={obj.data.activationCount + " new orchestrators"} descriptions={[
                obj.data.activationCount + " orchestrators joined with an initial stake of " + obj.data.activationInitialSum.toLocaleString({ maximumFractionDigits: 2 }) + " LPT"
              ]} />
            </div>
          </div> : null
        }
        {(obj.data.latestCommission && obj.data.latestCommission.length) ?
          <div className="stroke" style={{ width: 'unset' }}>
            <div className="halfVerticalDivider" />
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'stretch', maxWidth: '61.8%', textAlign: 'justify', padding: '0.5em', backgroundColor: updateColour, border: '0.1em solid rgba(54, 46, 46, 0.1)' }}>
              <Ticket seed={obj.seed + "-neworchs-"} icon={"🔗"} subtext={obj.data.latestCommission.length + " orchestrators found"} descriptions={[
                obj.data.latestCommission.length + "  orchestrators had a total of " + totalStakeSum.toLocaleString({ maximumFractionDigits: 2 }) + " LPT staked to them"
              ]} />
            </div>
          </div> : null}
        {obj.data.bondCount ?
          <div className="stroke" style={{ width: "unset" }}>
            <div className="halfVerticalDivider" />
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'stretch', maxWidth: '61.8%', textAlign: 'justify', padding: '0.5em', backgroundColor: stakeColour, border: '0.1em solid rgba(54, 46, 46, 0.1)' }}>
              <Ticket seed={obj.seed + "-neworchs-"} icon={"📈"} subtext={obj.data.bondCount + " new delegators"} descriptions={[
                obj.data.bondCount + " accounts delegated for the first time for a total of " + obj.data.bondStakeSum.toLocaleString({ maximumFractionDigits: 2 }) + " LPT"
              ]} />
            </div>
          </div> : null
        }
        {obj.data.unbondCount ?
          <div className="stroke" style={{ width: 'unset' }}>
            <div className="halfVerticalDivider" />
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'stretch', maxWidth: '61.8%', textAlign: 'justify', padding: '0.5em', backgroundColor: unbondColour, border: '0.1em solid rgba(54, 46, 46, 0.1)' }}>
              <Ticket seed={obj.seed + "-neworchs-"} icon={"📉"} subtext={obj.data.unbondCount + " leaving delegators"} descriptions={[
                obj.data.unbondCount + " delegators unbonded " + obj.data.unbondStakeSum.toLocaleString({ maximumFractionDigits: 2 }) + " LPT"
              ]} />
            </div>
          </div> : null
        }
        {obj.data.rewardCount ?
          <div className="stroke" style={{ width: 'unset' }}>
            <div className="halfVerticalDivider" />
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'stretch', maxWidth: '61.8%', textAlign: 'justify', padding: '0.5em', backgroundColor: rewardColour, border: '0.1em solid rgba(54, 46, 46, 0.1)' }}>
              <Ticket seed={obj.seed + "-neworchs-"} icon={"⌛"} subtext={obj.data.rewardCount + " reward calls"} descriptions={[
                obj.data.rewardCount + " reward calls made by orchestrators were worth " + obj.data.rewardAmountSum.toLocaleString({ maximumFractionDigits: 2 }) + " LPT"
              ]} />
            </div>
          </div> : null
        }
        {obj.data.claimCount ?
          <div className="stroke" style={{ width: 'unset' }}>
            <div className="halfVerticalDivider" />
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'stretch', maxWidth: '61.8%', textAlign: 'justify', padding: '0.5em', backgroundColor: claimColour, border: '0.1em solid rgba(54, 46, 46, 0.1)' }}>
              <Ticket seed={obj.seed + "-neworchs-"} icon={"🏦"} subtext={obj.data.claimCount + " reward claims"} descriptions={[
                obj.data.claimRewardSum.toLocaleString({ maximumFractionDigits: 2 }) + "  LPT and " + obj.data.claimFeeSum.toLocaleString({ maximumFractionDigits: 2 }) + " ETH worth of rewards were claimed by delegators"
              ]} />
            </div>
          </div> : null
        }
        {obj.data.withdrawStakeCount ?
          <div className="stroke" style={{ width: 'unset' }}>
            <div className="halfVerticalDivider" />
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'stretch', maxWidth: '61.8%', textAlign: 'justify', padding: '0.5em', backgroundColor: withdrawStakeColour, border: '0.1em solid rgba(54, 46, 46, 0.1)' }}>
              <Ticket seed={obj.seed + "-neworchs-"} icon={"💸"} subtext={obj.data.withdrawStakeCount + " withdraw reward calls"} descriptions={[
                obj.data.withdrawStakeAmountSum.toLocaleString({ maximumFractionDigits: 2 }) + " LPT worth of staking rewards were withdrawn to the accounts of delegators"
              ]} />
            </div>
          </div> : null
        }
        {obj.data.withdrawFeesCount ?
          <div className="stroke" style={{ width: 'unset' }}>
            <div className="halfVerticalDivider" />
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'stretch', maxWidth: '61.8%', textAlign: 'justify', padding: '0.5em', backgroundColor: withdrawStakeColour, border: '0.1em solid rgba(54, 46, 46, 0.1)' }}>
              <Ticket seed={obj.seed + "-neworchs-"} icon={"💸"} subtext={obj.data.withdrawFeesCount + " withdraw fee calls"} descriptions={[
                obj.data.withdrawFeesAmountSum.toLocaleString({ maximumFractionDigits: 2 }) + " ETH worth of transcoding fees were withdrawn to the accounts of delegators"
              ]} />
            </div>
          </div> : null
        }
        {obj.data.moveStakeCount ?
          <div className="stroke" style={{ width: 'unset' }}>
            <div className="halfVerticalDivider" />
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'stretch', maxWidth: '61.8%', textAlign: 'justify', padding: '0.5em', backgroundColor: stakeColour, border: '0.1em solid rgba(54, 46, 46, 0.1)' }}>
              <Ticket seed={obj.seed + "-neworchs-"} icon={"🔄"} subtext={obj.data.moveStakeCount + " stake movements"} descriptions={[
                obj.data.moveStakeSum.toLocaleString({ maximumFractionDigits: 2 }) + " LPT worth of stake was moved between orchestrators"
              ]} />
            </div>
          </div> : null
        }
        {obj.data.winningTicketsReceivedCount ?
          <div className="stroke" style={{ width: 'unset' }}>
            <div className="halfVerticalDivider" />
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'stretch', maxWidth: '61.8%', textAlign: 'justify', padding: '0.5em', backgroundColor: ticketTransferColour, border: '0.1em solid rgba(54, 46, 46, 0.1)' }}>
              <Ticket seed={obj.seed + "-neworchs-"} icon={"🎫"} subtext={obj.data.winningTicketsReceivedCount + " winning tickets"} descriptions={[
                obj.data.winningTicketsReceivedCount + " winning tickets were sent out by " + obj.data.winningTicketsSent.length + " broadcasters"
              ]} />
            </div>
          </div> : null
        }
        {obj.data.winningTicketsRedeemedCount ?
          <div className="stroke" style={{ width: 'unset' }}>
            <div className="halfVerticalDivider" />
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'stretch', maxWidth: '61.8%', textAlign: 'justify', padding: '0.5em', backgroundColor: ticketRedeemColour, border: '0.1em solid rgba(54, 46, 46, 0.1)' }}>
              <Ticket seed={obj.seed + "-neworchs-"} icon={"🎟️"} subtext={obj.data.winningTicketsRedeemedCount + " redeemed tickets"} descriptions={[
                obj.data.winningTicketsRedeemedCount + " winning tickets were redeemed worth " + obj.data.winningTicketsRedeemedSum.toLocaleString({ maximumFractionDigits: 2 }) + " ETH"
              ]} />
            </div>
          </div> : null
        }
        <div className="halfVerticalDivider" />
        <button className="selectOrchLight" onClick={() => {
          copyLink(summary);
        }}>
          <img alt="" src="clipboard.svg" width="20em" height="20em" />
        </button>
        <div className="halfVerticalDivider" />
      </div>
    </div>
  )
}

export default MonthlyFactoids;