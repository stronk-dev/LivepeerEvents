

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