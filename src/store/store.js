import { createStore, applyMiddleware, compose  } from "redux";
import thunk from "redux-thunk";
import reducer from "../reducers/root";

function configureStore(preloadedState) {
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  const store = createStore(reducer, preloadedState, composeEnhancers(
    applyMiddleware(thunk)
    ));

  return store;
}

export default (preloadedState) => (
  configureStore(preloadedState)
);