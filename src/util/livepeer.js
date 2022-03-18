

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
