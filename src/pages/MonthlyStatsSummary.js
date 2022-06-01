import React from 'react';

const MonthlyStatsSummary = (obj) => {
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

  return (
    <div className="stroke insetEffect" key={obj.seed + "factoids"}>
      <div className="hostInfo" style={{ flexDirection: 'column' }}>
        {obj.data.reactivationCount ?
          <div className="stroke" style={{ width: 'unset' }}>
            <p>🔌 {obj.data.reactivationCount} orchestrators reactivated</p>
          </div> : null
        }
        {obj.data.activationCount ?
          <div className="stroke" style={{ width: 'unset' }}>
            <p>🔧 {obj.data.activationCount} orchestrators joined with an initial stake of {obj.data.activationInitialSum.toLocaleString({ maximumFractionDigits: 2 })} LPT</p>
          </div> : null
        }
        {(obj.data.latestCommission && obj.data.latestCommission.length) ?
          <div className="stroke" style={{ width: 'unset' }}>
            <p>🔗 {obj.data.latestCommission.length} orchestrators had a total of {totalStakeSum.toLocaleString({ maximumFractionDigits: 2 })} LPT staked to them</p>
          </div> : null
        }
        {obj.data.bondCount ?
          <div className="stroke" style={{ width: 'unset' }}>
            <p>📈 {obj.data.bondCount} accounts delegated for the first time for a total of {obj.data.bondStakeSum.toLocaleString({ maximumFractionDigits: 2 })} LPT</p>
          </div> : null
        }
        {obj.data.unbondCount ?
          <div className="stroke" style={{ width: 'unset' }}>
            <p>📉 {obj.data.unbondCount} delegators unbonded {obj.data.unbondStakeSum.toLocaleString({ maximumFractionDigits: 2 })} LPT</p>
          </div> : null
        }
        {obj.data.rewardCount ?
          <div className="stroke" style={{ width: 'unset' }}>
            <p>⌛ {obj.data.rewardCount} reward calls made were made by orchestrators worth {obj.data.rewardAmountSum.toLocaleString({ maximumFractionDigits: 2 })} LPT</p>
          </div> : null
        }
        {obj.data.claimCount ?
          <div className="stroke" style={{ width: 'unset' }}>
            <p>🏦 {obj.data.claimRewardSum.toLocaleString({ maximumFractionDigits: 2 })} LPT and {obj.data.claimFeeSum.toLocaleString({ maximumFractionDigits: 2 })} ETH worth of rewards were claimed by delegators</p>
          </div> : null
        }
        {obj.data.withdrawStakeCount ?
          <div className="stroke" style={{ width: 'unset' }}>
            <p>💸 {obj.data.withdrawStakeAmountSum.toLocaleString({ maximumFractionDigits: 2 })} LPT worth of stake was withdrawn to the account of delegators</p>
          </div> : null
        }
        {obj.data.withdrawFeesCount ?
          <div className="stroke" style={{ width: 'unset' }}>
            <p>💸 {obj.data.withdrawFeesAmountSum.toLocaleString({ maximumFractionDigits: 2 })} ETH worth of transcoding fees were withdrawn to the account of the delegator</p>
          </div> : null
        }
        {obj.data.moveStakeCount ?
          <div className="stroke" style={{ width: 'unset' }}>
            <p>🔄 {obj.data.moveStakeSum.toLocaleString({ maximumFractionDigits: 2 })} LPT worth of stake was moved between orchestrators</p>
          </div> : null
        }
        {obj.data.winningTicketsReceivedCount ?
          <div className="stroke" style={{ width: 'unset' }}>
            <p>🎫 {obj.data.winningTicketsReceivedCount} winning tickets were sent out by {obj.data.winningTicketsSent.length} broadcasters</p>
          </div> : null
        }
        {obj.data.winningTicketsRedeemedCount ?
          <div className="stroke" style={{ width: 'unset' }}>
            <p>🎟️ {obj.data.winningTicketsRedeemedCount} winning tickets were redeemed worth {obj.data.winningTicketsRedeemedSum.toLocaleString({ maximumFractionDigits: 2 })} ETH</p>
          </div> : null
        }
        <div className="halfVerticalDivider" />
      </div>
    </div>
  )


}

export default MonthlyStatsSummary;