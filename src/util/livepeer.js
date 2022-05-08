

export const getQuotes = () => (
  fetch("api/livepeer/quotes", {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  })
);

export const getBlockchainData = () => (
  fetch("api/livepeer/blockchains", {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  })
);

export const getEvents = () => (
  fetch("api/livepeer/getEvents", {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  })
);

export const getTickets = () => (
  fetch("api/livepeer/getTickets", {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  })
);

export const getCurrentOrchestratorInfo = () => (
  fetch("api/livepeer/getOrchestrator", {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  })
);

export const getOrchestratorInfo = (orchAddr) => (
  fetch("api/livepeer/getOrchestrator/" + orchAddr, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  })
);

export const getOrchestratorByDelegator = (delAddr) => (
  fetch("api/livepeer/getOrchestratorByDelegator/" + delAddr, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  })
);

export const getAllEnsDomains = () => (
  fetch("api/livepeer/getEnsDomains/", {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  })
);

export const getAllEnsInfo = () => (
  fetch("api/livepeer/getEnsInfo/", {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  })
);

export const getEnsInfo = (addr) => (
  fetch("api/livepeer/getENS/" + addr, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  })
);

export const getOrchestratorScores = (year, month) => (
  fetch("api/livepeer/getOrchestratorScores", {
    method: "POST",
    body: JSON.stringify({ year, month }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
);

export const getAllOrchScores = () => (
  fetch("api/livepeer/getAllOrchScores", {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  })
);

export const getAllOrchInfo = () => (
  fetch("api/livepeer/getAllOrchInfo", {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  })
);

export const getAllDelInfo = () => (
  fetch("api/livepeer/getAllDelInfo", {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  })
);

export const getAllMonthlyStats = (smartUpdate) => (
  fetch("api/livepeer/getAllMonthlyStats", {
    method: "POST",
    body: JSON.stringify({ smartUpdate }),
    headers: {
      "Content-Type": "application/json"
    }
  })
);

export const getAllCommissions = () => (
  fetch("api/livepeer/getAllCommissions", {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  })
);

export const getAllTotalStakes = () => (
  fetch("api/livepeer/getAllTotalStakes", {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  })
);

export const getAllUpdateEvents = (smartUpdate) => (
  fetch("api/livepeer/getAllUpdateEvents", {
    method: "POST",
    body: JSON.stringify({ smartUpdate }),
    headers: {
      "Content-Type": "application/json"
    }
  })
);

export const getAllRewardEvents = (smartUpdate) => (
  fetch("api/livepeer/getAllRewardEvents", {
    method: "POST",
    body: JSON.stringify({ smartUpdate }),
    headers: {
      "Content-Type": "application/json"
    }
  })
);

export const getAllClaimEvents = (smartUpdate) => (
  fetch("api/livepeer/getAllClaimEvents", {
    method: "POST",
    body: JSON.stringify({ smartUpdate }),
    headers: {
      "Content-Type": "application/json"
    }
  })
);

export const getAllWithdrawStakeEvents = (smartUpdate) => (
  fetch("api/livepeer/getAllWithdrawStakeEvents", {
    method: "POST",
    body: JSON.stringify({ smartUpdate }),
    headers: {
      "Content-Type": "application/json"
    }
  })
);

export const getAllWithdrawFeesEvents = (smartUpdate) => (
  fetch("api/livepeer/getAllWithdrawFeesEvents", {
    method: "POST",
    body: JSON.stringify({ smartUpdate }),
    headers: {
      "Content-Type": "application/json"
    }
  })
);

export const getAllTransferTicketEvents = (smartUpdate) => (
  fetch("api/livepeer/getAllTransferTicketEvents", {
    method: "POST",
    body: JSON.stringify({ smartUpdate }),
    headers: {
      "Content-Type": "application/json"
    }
  })
);

export const getAllRedeemTicketEvents = (smartUpdate) => (
  fetch("api/livepeer/getAllRedeemTicketEvents", {
    method: "POST",
    body: JSON.stringify({ smartUpdate }),
    headers: {
      "Content-Type": "application/json"
    }
  })
);

export const getAllActivateEvents = (smartUpdate) => (
  fetch("api/livepeer/getAllActivateEvents", {
    method: "POST",
    body: JSON.stringify({ smartUpdate }),
    headers: {
      "Content-Type": "application/json"
    }
  })
);

export const getAllUnbondEvents = (smartUpdate) => (
  fetch("api/livepeer/getAllUnbondEvents", {
    method: "POST",
    body: JSON.stringify({ smartUpdate }),
    headers: {
      "Content-Type": "application/json"
    }
  })
);

export const getAllStakeEvents = (smartUpdate) => (
  fetch("api/livepeer/getAllStakeEvents", {
    method: "POST",
    body: JSON.stringify({ smartUpdate }),
    headers: {
      "Content-Type": "application/json"
    }
  })
);

export const hasAnyRefresh = () => (
  fetch("api/livepeer/hasAnyRefresh", {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  })
);

export const getAllRounds = () => (
  fetch("api/livepeer/getAllRounds", {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  })
);

export const getRoundInfo = (roundNumber) => (
  fetch("api/livepeer/getRoundInfo", {
    method: "POST",
    body: JSON.stringify({ roundNumber }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
);