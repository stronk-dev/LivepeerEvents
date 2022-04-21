

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

export const getAllThreeBox = () => (
  fetch("api/livepeer/getAllThreeBox/", {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  })
);

export const getThreeBox = (addr) => (
  fetch("api/livepeer/getThreeBox/" + addr, {
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

export const getAllMonthlyStats = () => (
  fetch("api/livepeer/getAllMonthlyStats", {
    method: "GET",
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

export const getAllUpdateEvents = () => (
  fetch("api/livepeer/getAllUpdateEvents", {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  })
);

export const getAllRewardEvents = () => (
  fetch("api/livepeer/getAllRewardEvents", {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  })
);

export const getAllClaimEvents = () => (
  fetch("api/livepeer/getAllClaimEvents", {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  })
);

export const getAllWithdrawStakeEvents = () => (
  fetch("api/livepeer/getAllWithdrawStakeEvents", {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  })
);

export const getAllWithdrawFeesEvents = () => (
  fetch("api/livepeer/getAllWithdrawFeesEvents", {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  })
);

export const getAllTransferTicketEvents = () => (
  fetch("api/livepeer/getAllTransferTicketEvents", {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  })
);

export const getAllRedeemTicketEvents = () => (
  fetch("api/livepeer/getAllRedeemTicketEvents", {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  })
);

export const getAllActivateEvents = () => (
  fetch("api/livepeer/getAllActivateEvents", {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  })
);

export const getAllUnbondEvents = () => (
  fetch("api/livepeer/getAllUnbondEvents", {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  })
);

export const getAllStakeEvents = () => (
  fetch("api/livepeer/getAllStakeEvents", {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  })
);