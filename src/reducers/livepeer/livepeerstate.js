import {
  RECEIVE_QUOTES,
  RECEIVE_BLOCKCHAIN_DATA,
  RECEIVE_EVENTS,
  RECEIVE_ORCHESTRATOR
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
    case RECEIVE_ORCHESTRATOR:
      return { ...state, thisOrchestrator: message.transcoders[0] };
    default:
      return { ...state };
  }
};
