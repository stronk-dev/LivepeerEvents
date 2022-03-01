import { combineReducers } from "redux";
import errors from "./errors/errors";
import session from "./session/session";
import userstate from "./userstate/userstate";
import livepeerstate from "./livepeer/livepeerstate";
{/*Reducers define how the state of the application changes when actions are sent into the store. They take in the current state and the action that was performed.
This file combines all reducers in use so they are all accessible for redux*/}
export default combineReducers({
  session,
  errors,
  userstate,
  livepeerstate
});