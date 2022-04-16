import {
  RECEIVE_QUOTES,
  RECEIVE_BLOCKCHAIN_DATA,
  RECEIVE_EVENTS,
  RECEIVE_ORCHESTRATOR,
  RECEIVE_CURRENT_ORCHESTRATOR,
  CLEAR_ORCHESTRATOR,
  RECEIVE_TICKETS,
  RECEIVE_WINNING_TICKETS,
  SET_ALL_ENS_INFO,
  SET_ALL_ENS_DOMAINS,
  SET_ALL_THREEBOX_INFO,
  SET_ALL_ORCH_SCORES
} from "../../actions/livepeer";

export default (state = {
  quotes: [],
  blockchains: [],
  events: [],
  thisOrchestrator: null,
  selectedOrchestrator: null,
  tickets: [],
  ensInfoMapping: [],
  ensDomainMapping: [],
  winningTickets: [],
  orchScores: []
}, { type, message }) => {
  Object.freeze(state);
  switch (type) {
    case RECEIVE_QUOTES:
      return { ...state, quotes: message };
    case RECEIVE_BLOCKCHAIN_DATA:
      return { ...state, blockchains: message };
    case RECEIVE_EVENTS:
      return { ...state, events: message };
    case RECEIVE_CURRENT_ORCHESTRATOR:
      return { ...state, thisOrchestrator: message };
    case RECEIVE_ORCHESTRATOR:
      return { ...state, selectedOrchestrator: message };
    case CLEAR_ORCHESTRATOR:
      return { ...state, selectedOrchestrator: null };
    case RECEIVE_TICKETS:
      return { ...state, tickets: message };
    case RECEIVE_WINNING_TICKETS:
      return { ...state, winningTickets: message };
    case SET_ALL_ENS_INFO:
      return { ...state, ensInfoMapping: message };
    case SET_ALL_ENS_DOMAINS:
      return { ...state, ensDomainMapping: message };
    case SET_ALL_THREEBOX_INFO:
      return { ...state, threeBoxInfo: message };
    case SET_ALL_ORCH_SCORES:
      return { ...state, orchScores: message };
    default:
      return { ...state };
  }
};
