import {
  RECEIVE_QUOTES,
  RECEIVE_BLOCKCHAIN_DATA,
  RECEIVE_EVENTS,
  RECEIVE_ORCHESTRATOR,
  RECEIVE_CURRENT_ORCHESTRATOR,
  CLEAR_ORCHESTRATOR,
  RECEIVE_TICKETS
} from "../../actions/livepeer";

export default (state = {}, { type, message }) => {
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
    default:
      return { ...state };
  }
};
