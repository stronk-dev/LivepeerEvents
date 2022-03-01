

export const getVisitorStats = () => (
  fetch("api/users/getVisitorStats", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    }
  })
);

export const getCurrentUserVotes = () => (
  fetch("api/users/getCurrentUserVotes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    }
  })
);

export const getScoreByTimelapeFilename = (fullFilename) => (
  fetch("api/users/getScoreByTimelapeFilename", {
    method: "POST",
    body: JSON.stringify({ fullFilename }),
    headers: {
      "Content-Type": "application/json"
    }
  })
);

export const setVoteOnTimelapse = (voteValue, fullFilename) => (
  fetch("api/users/setVoteOnTimelapse", {
    method: "POST",
    body: JSON.stringify({ voteValue, fullFilename }),
    headers: {
      "Content-Type": "application/json"
    }
  })
);

