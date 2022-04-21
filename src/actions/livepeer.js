import * as apiUtil from "../util/livepeer";
import { receiveErrors } from "./error";

export const RECEIVE_QUOTES = "RECEIVE_QUOTES";
export const RECEIVE_BLOCKCHAIN_DATA = "RECEIVE_BLOCKCHAIN_DATA";
export const RECEIVE_EVENTS = "RECEIVE_EVENTS";
export const RECEIVE_CURRENT_ORCHESTRATOR = "RECEIVE_CURRENT_ORCHESTRATOR";
export const CACHE_ORCHESTRATOR = "CACHE_ORCHESTRATOR";
export const RECEIVE_ORCHESTRATOR = "RECEIVE_ORCHESTRATOR";
export const CLEAR_ORCHESTRATOR = "CLEAR_ORCHESTRATOR";
export const RECEIVE_TICKETS = "RECEIVE_TICKETS";
export const RECEIVE_WINNING_TICKETS = "RECEIVE_WINNING_TICKETS";
export const SET_ALL_ENS_INFO = "SET_ALL_ENS_INFO";
export const SET_ALL_ENS_DOMAINS = "SET_ALL_ENS_DOMAINS";
export const SET_ALL_THREEBOX_INFO = "SET_ALL_THREEBOX_INFO";
export const SET_ALL_ORCH_SCORES = "SET_ALL_ORCH_SCORES";
export const SET_ALL_ORCH_INFO = "SET_ALL_ORCH_INFO";
export const SET_ALL_DEL_INFO = "SET_ALL_DEL_INFO";
export const SET_ALL_MONTHLY_STATS = "SET_ALL_MONTHLY_STATS";
export const SET_ALL_UPDATE_EVENTS = "SET_ALL_UPDATE_EVENTS";
export const SET_ALL_REWARD_EVENTS = "SET_ALL_REWARD_EVENTS";
export const SET_ALL_CLAIM_EVENTS = "SET_ALL_CLAIM_EVENTS";
export const SET_ALL_WITHDRAW_STAKE_EVENTS = "SET_ALL_WITHDRAW_STAKE_EVENTS";
export const SET_ALL_WITHDRAW_FEES_EVENTS = "SET_ALL_WITHDRAW_FEES_EVENTS";
export const SET_ALL_TRANSFER_TICKET_EVENTS = "SET_ALL_TRANSFER_TICKET_EVENTS";
export const SET_ALL_REDEEM_TICKET_EVENTS = "SET_ALL_REDEEM_TICKET_EVENTS";
export const SET_ALL_ACTIVATE_EVENTS = "SET_ALL_ACTIVATE_EVENTS";
export const SET_ALL_UNBOND_EVENTS = "SET_ALL_UNBOND_EVENTS";
export const SET_ALL_STAKE_EVENTS = "SET_ALL_STAKE_EVENTS";

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
const cacheNewOrch = message => ({
  type: CACHE_ORCHESTRATOR, message
});
const setOrchestratorInfo = message => ({
  type: RECEIVE_ORCHESTRATOR, message
});
const clearOrchestratorInfo = () => ({
  type: CLEAR_ORCHESTRATOR
})
const setTickets = message => ({
  type: RECEIVE_TICKETS, message
});
const setWinningTickets = message => ({
  type: RECEIVE_WINNING_TICKETS, message
});
const setAllEnsInfo = message => ({
  type: SET_ALL_ENS_INFO, message
});
const setAllEnsDomains = message => ({
  type: SET_ALL_ENS_DOMAINS, message
});
const setAllThreeBoxInfo = message => ({
  type: SET_ALL_THREEBOX_INFO, message
});
const setAllOrchScores = message => ({
  type: SET_ALL_ORCH_SCORES, message
});
const setAllOrchInfo = message => ({
  type: SET_ALL_ORCH_INFO, message
});

const setAllDelInfo = message => ({
  type: SET_ALL_DEL_INFO, message
});

const setAllMonthlyStats = message => ({
  type: SET_ALL_MONTHLY_STATS, message
});

const setAllUpdateEvents = message => ({
  type: SET_ALL_UPDATE_EVENTS, message
});

const setAllRewardEvents = message => ({
  type: SET_ALL_REWARD_EVENTS, message
});

const setAllClaimEvents = message => ({
  type: SET_ALL_CLAIM_EVENTS, message
});

const setAllWithdrawStakeEvents = message => ({
  type: SET_ALL_WITHDRAW_STAKE_EVENTS, message
});

const setAllWithdrawFeesEvents = message => ({
  type: SET_ALL_WITHDRAW_FEES_EVENTS, message
});

const setAllTransferTicketEvents = message => ({
  type: SET_ALL_TRANSFER_TICKET_EVENTS, message
});

const setAllRedeemTicketEvents = message => ({
  type: SET_ALL_REDEEM_TICKET_EVENTS, message
});

const setAllActivateEvents = message => ({
  type: SET_ALL_ACTIVATE_EVENTS, message
});

const setAllUnbondEvents = message => ({
  type: SET_ALL_UNBOND_EVENTS, message
});

const setAllStakeEvents = message => ({
  type: SET_ALL_STAKE_EVENTS, message
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

export const getCurrentOrchestratorInfo = () => async dispatch => {
  const response = await apiUtil.getCurrentOrchestratorInfo();
  const data = await response.json();
  if (response.ok) {
    return dispatch(setCurrentOrchestratorInfo(data));
  }
  return dispatch(receiveErrors(data));
};

export const getOrchestratorInfoSilent = (orchAddr) => async dispatch => {
  const response = await apiUtil.getOrchestratorInfo(orchAddr);
  const data = await response.json();
  if (response.ok) {
    if (data && data.id) {
      return dispatch(cacheNewOrch(data));
    }
  }
};

export const getOrchestratorInfo = (orchAddr) => async dispatch => {
  const response = await apiUtil.getOrchestratorInfo(orchAddr);
  const data = await response.json();
  if (response.ok) {
    if (data && data.id) {
      dispatch(cacheNewOrch(data));
      return dispatch(setOrchestratorInfo(data));
    } else {
      const response = await apiUtil.getOrchestratorByDelegator(orchAddr);
      const data = await response.json();
      if (response.ok) {
        dispatch(cacheNewOrch(data));
        return dispatch(setOrchestratorInfo(data));
      }
    }
  }
  return dispatch(receiveErrors(data));
};

export const setCachedOrch = (orchObj) => async dispatch => {
  return dispatch(setOrchestratorInfo(orchObj));
};

export const clearOrchestrator = () => async dispatch => {
  return dispatch(clearOrchestratorInfo({}));
};

export const getAllEnsDomains = () => async dispatch => {
  const response = await apiUtil.getAllEnsDomains();
  const data = await response.json();
  if (response.ok) {
    return dispatch(setAllEnsDomains(data));
  }
  return dispatch(receiveErrors(data));
};

export const getAllEnsInfo = () => async dispatch => {
  const response = await apiUtil.getAllEnsInfo();
  const data = await response.json();
  if (response.ok) {
    return dispatch(setAllEnsInfo(data));
  }
  return dispatch(receiveErrors(data));
};

export const getEnsInfo = async (addr) => {
  const response = apiUtil.getEnsInfo(addr);
};


export const getAllThreeBoxInfo = () => async dispatch => {
  const response = await apiUtil.getAllThreeBox();
  const data = await response.json();
  if (response.ok) {
    return dispatch(setAllThreeBoxInfo(data));
  }
  return dispatch(receiveErrors(data));
};

export const getThreeBoxInfo = async (addr) => {
  const response = apiUtil.getThreeBox(addr);
};

export const getOrchestratorScores = async (year, month) => {
  const response = await apiUtil.getOrchestratorScores(year, month);
  const data = await response.json();
  if (response.ok) {
    return data;
  }
};

export const getAllOrchScores = () => async dispatch => {
  const response = await apiUtil.getAllOrchScores();
  const data = await response.json();
  if (response.ok) {
    return dispatch(setAllOrchScores(data));
  }
  return dispatch(receiveErrors(data));
};

export const getAllOrchInfo = () => async dispatch => {
  const response = await apiUtil.getAllOrchInfo();
  const data = await response.json();
  if (response.ok) {
    return dispatch(setAllOrchInfo(data));
  }
  return dispatch(receiveErrors(data));
};

export const getAllDelInfo = () => async dispatch => {
  const response = await apiUtil.getAllDelInfo();
  const data = await response.json();
  if (response.ok) {
    return dispatch(setAllDelInfo(data));
  }
  return dispatch(receiveErrors(data));
};

export const getAllMonthlyStats = () => async dispatch => {
  const response = await apiUtil.getAllMonthlyStats();
  const data = await response.json();
  if (response.ok) {
    return dispatch(setAllMonthlyStats(data));
  }
  return dispatch(receiveErrors(data));
};

export const getAllUpdateEvents = () => async dispatch => {
  const response = await apiUtil.getAllUpdateEvents();
  const data = await response.json();
  if (response.ok) {
    if (data && data.length){
      return dispatch(setAllUpdateEvents(data));
    }
  }
  return dispatch(receiveErrors(data));
};

export const getAllRewardEvents = () => async dispatch => {
  const response = await apiUtil.getAllRewardEvents();
  const data = await response.json();
  if (response.ok) {
    if (data && data.length){
      return dispatch(setAllRewardEvents(data));
    }
  }
  return dispatch(receiveErrors(data));
};

export const getAllClaimEvents = () => async dispatch => {
  const response = await apiUtil.getAllClaimEvents();
  const data = await response.json();
  if (response.ok) {
    if (data && data.length){
      return dispatch(setAllClaimEvents(data));
    }
  }
  return dispatch(receiveErrors(data));
};

export const getAllWithdrawStakeEvents = () => async dispatch => {
  const response = await apiUtil.getAllWithdrawStakeEvents();
  const data = await response.json();
  if (response.ok) {
    if (data && data.length){
      return dispatch(setAllWithdrawStakeEvents(data));
    }
  }
  return dispatch(receiveErrors(data));
};

export const getAllWithdrawFeesEvents = () => async dispatch => {
  const response = await apiUtil.getAllWithdrawFeesEvents();
  const data = await response.json();
  if (response.ok) {
    if (data && data.length){
      return dispatch(setAllWithdrawFeesEvents(data));
    }
  }
  return dispatch(receiveErrors(data));
};

export const getAllTransferTicketEvents = () => async dispatch => {
  const response = await apiUtil.getAllTransferTicketEvents();
  const data = await response.json();
  if (response.ok) {
    if (data && data.length){
      return dispatch(setAllTransferTicketEvents(data));
    }
  }
  return dispatch(receiveErrors(data));
};

export const getAllRedeemTicketEvents = () => async dispatch => {
  const response = await apiUtil.getAllRedeemTicketEvents();
  const data = await response.json();
  if (response.ok) {
    if (data && data.length){
      return dispatch(setAllRedeemTicketEvents(data));
    }
  }
  return dispatch(receiveErrors(data));
};

export const getAllActivateEvents = () => async dispatch => {
  const response = await apiUtil.getAllActivateEvents();
  const data = await response.json();
  if (response.ok) {
    if (data && data.length){
      return dispatch(setAllActivateEvents(data));
    }
  }
  return dispatch(receiveErrors(data));
};

export const getAllUnbondEvents = () => async dispatch => {
  const response = await apiUtil.getAllUnbondEvents();
  const data = await response.json();
  if (response.ok) {
    if (data && data.length){
      return dispatch(setAllUnbondEvents(data));
    }
  }
  return dispatch(receiveErrors(data));
};

export const getAllStakeEvents = () => async dispatch => {
  const response = await apiUtil.getAllStakeEvents();
  const data = await response.json();
  if (response.ok) {
    if (data && data.length){
      return dispatch(setAllStakeEvents(data));
    }
  }
  return dispatch(receiveErrors(data));
};