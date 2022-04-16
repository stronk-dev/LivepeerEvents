

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