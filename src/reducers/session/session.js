import {
  RECEIVE_CURRENT_USER
} from "../../actions/session";
const _nullSession = { userId: null, username: null, ip: null }
export default (state = _nullSession, { type, user }) => {
  Object.freeze(state);
  switch (type) {
    case RECEIVE_CURRENT_USER:
      return user;
    default:
      return state;
  }
};