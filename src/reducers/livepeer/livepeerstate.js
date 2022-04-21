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
  SET_ALL_ORCH_SCORES,
  SET_ALL_ORCH_INFO,
  SET_ALL_DEL_INFO,
  CACHE_ORCHESTRATOR,
  SET_ALL_MONTHLY_STATS,
  SET_ALL_UPDATE_EVENTS,
  SET_ALL_REWARD_EVENTS,
  SET_ALL_CLAIM_EVENTS,
  SET_ALL_WITHDRAW_STAKE_EVENTS,
  SET_ALL_WITHDRAW_FEES_EVENTS,
  SET_ALL_TRANSFER_TICKET_EVENTS,
  SET_ALL_REDEEM_TICKET_EVENTS,
  SET_ALL_ACTIVATE_EVENTS,
  SET_ALL_UNBOND_EVENTS,
  SET_ALL_STAKE_EVENTS
} from "../../actions/livepeer";

export default (state = {
  quotes: [],
  blockchains: [],
  thisOrchestrator: null,
  selectedOrchestrator: null,
  winningTickets: [],
  orchScores: [],
  monthlyStats: [],
  updateEvents: [],
  rewardEvents: [],
  claimEvents: [],
  withdrawStakeEvents: [],
  withdrawFeesEvents: [],
  transferTicketEvents: [],
  redeemTicketEvents: [],
  activateEvents: [],
  unbondEvents: [],
  stakeEvents: [],
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
    case SET_ALL_ORCH_INFO:
      return { ...state, orchInfo: message };
    case CACHE_ORCHESTRATOR:
      let isCached = false;
      // Check to see if it is already cached
      if (state.orchInfo) {
        for (const thisOrch of state.orchInfo) {
          if (thisOrch.id === message.id) {
            isCached = true;
            break;
          }
        }
      }
      // If cached, lookup and modify existing entry
      if (isCached) {
        return {
          ...state,
          contents: state.orchInfo.map(
            (content) => {
              if (content.id == message.id) {
                return message;
              } else {
                return content;
              }
            }
          )
        }
      } else {
        return {
          ...state,
          orchInfo: [...state.orchInfo, message]
        };
      }
    case SET_ALL_DEL_INFO:
      return { ...state, delInfo: message };
    case SET_ALL_MONTHLY_STATS:
      return { ...state, monthlyStats: message };
    case SET_ALL_UPDATE_EVENTS:
      return { ...state, updateEvents: message };
    case SET_ALL_REWARD_EVENTS:
      return { ...state, rewardEvents: message };
    case SET_ALL_CLAIM_EVENTS:
      return { ...state, claimEvents: message };
    case SET_ALL_WITHDRAW_STAKE_EVENTS:
      return { ...state, withdrawStakeEvents: message };
    case SET_ALL_WITHDRAW_FEES_EVENTS:
      return { ...state, withdrawFeesEvents: message };
    case SET_ALL_TRANSFER_TICKET_EVENTS:
      return { ...state, transferTicketEvents: message };
    case SET_ALL_REDEEM_TICKET_EVENTS:
      return { ...state, redeemTicketEvents: message };
    case SET_ALL_ACTIVATE_EVENTS:
      return { ...state, activateEvents: message };
    case SET_ALL_UNBOND_EVENTS:
      return { ...state, unbondEvents: message };
    case SET_ALL_STAKE_EVENTS:
      return { ...state, stakeEvents: message };
    default:
      return { ...state };
  }
};
