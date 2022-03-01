import {
  RECEIVE_VISITOR_STATS,
  RECEIVE_CURRENT_USER_VOTES
} from "../../actions/user";

export default (state = {}, { type, message }) => {
  Object.freeze(state);
  switch (type) {
    case RECEIVE_VISITOR_STATS:
      return { ...state, visitorStats: message};
    case RECEIVE_CURRENT_USER_VOTES:
      return { ...state, currentVotes: message};
    default:
      return { ...state };
  }
};
