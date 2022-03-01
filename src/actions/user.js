import * as apiUtil from "../util/user";
import { receiveErrors } from "./error";

export const RECEIVE_VISITOR_STATS = "RECEIVE_VISITOR_STATS";
export const RECEIVE_CURRENT_USER_VOTES = "RECEIVE_CURRENT_USER_VOTES";

const setVisitorStats = message => ({
  type: RECEIVE_VISITOR_STATS, message
});


const setCurrentUserVotes = message => ({
  type: RECEIVE_CURRENT_USER_VOTES, message
});

export const getVisitorStats = () => async dispatch => {
  const response = await apiUtil.getVisitorStats();
  const data = await response.json();
  if (response.ok) {
    return dispatch(setVisitorStats(data));
  }
  return dispatch(receiveErrors(data));
};

export const getCurrentUserVotes = () => async dispatch => {
  const response = await apiUtil.getCurrentUserVotes();
  const data = await response.json();
  if (response.ok) {
    return dispatch(setCurrentUserVotes(data));
  }
  return dispatch(receiveErrors(data));
};

export const getScoreByTimelapeFilename = (fullFilename) => async dispatch => {
  const response = await apiUtil.getScoreByTimelapeFilename(fullFilename);
  const data = await response.json();
  if (response.ok) {
    return data;
  }
  return dispatch(receiveErrors(data));
};

export const setVoteOnTimelapse = (voteValue, fullFilename) => async dispatch => {
  const response = await apiUtil.setVoteOnTimelapse(voteValue, fullFilename);
  const data = await response.json();
  if (response.ok) {
    return data;
  }
  return dispatch(receiveErrors(data));
};
