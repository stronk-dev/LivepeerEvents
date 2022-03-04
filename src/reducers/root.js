import { combineReducers } from "redux";
import errors from "./errors/errors";
import session from "./session/session";
import userstate from "./userstate/userstate";
import livepeerstate from "./livepeer/livepeerstate";
export default combineReducers({
  session,
  errors,
  userstate,
  livepeerstate
});