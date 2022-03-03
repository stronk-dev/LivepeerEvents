import * as apiUtil from "../util/livepeer";
import { receiveErrors } from "./error";

export const RECEIVE_QUOTES = "RECEIVE_QUOTES";
export const RECEIVE_BLOCKCHAIN_DATA = "RECEIVE_BLOCKCHAIN_DATA";
export const RECEIVE_EVENTS = "RECEIVE_EVENTS";
export const RECEIVE_CURRENT_ORCHESTRATOR = "RECEIVE_CURRENT_ORCHESTRATOR";
export const RECEIVE_ORCHESTRATOR = "RECEIVE_ORCHESTRATOR";

const setQuotes = message => ({
  type: RECEIVE_QUOTES, message
});
const setBlockchainData = message => ({
  type: RECEIVE_BLOCKCHAIN_DATA, message
});
const setEvents = message => ({
  type: RECEIVE_EVENTS, message
});
const setCurrentOrchestratorInfo = message => ({
  type: RECEIVE_CURRENT_ORCHESTRATOR, message
});
const setOrchestratorInfo = message => ({
  type: RECEIVE_ORCHESTRATOR, message
});

export const getQuotes = () => async dispatch => {
  const response = await apiUtil.getQuotes();
  const data = await response.json();
  if (response.ok) {
    return dispatch(setQuotes(data));
  }
  return dispatch(receiveErrors(data));
};

export const getBlockchainData = () => async dispatch => {
  const response = await apiUtil.getBlockchainData();
  const data = await response.json();
  if (response.ok) {
    return dispatch(setBlockchainData(data));
  }
  return dispatch(receiveErrors(data));
};

export const getEvents = () => async dispatch => {
  const response = await apiUtil.getEvents();
  const data = await response.json();
  if (response.ok) {
    return dispatch(setEvents(data));
  }
  return dispatch(receiveErrors(data));
};

export const getCurrentOrchestratorInfo = () => async dispatch => {
  const response = await apiUtil.getCurrentOrchestratorInfo();
  const data = await response.json();
  if (response.ok) {
    return dispatch(setCurrentOrchestratorInfo(data));
  }
  return dispatch(receiveErrors(data));
};

export const getOrchestratorInfo = (orchAddr) => async dispatch => {
  const response = await apiUtil.getOrchestratorInfo(orchAddr);
  const data = await response.json();
  if (response.ok) {
    return dispatch(setOrchestratorInfo(data));
  }
  return dispatch(receiveErrors(data));
};