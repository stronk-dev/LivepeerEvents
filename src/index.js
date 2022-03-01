import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import configureStore from "./store/store";
import { Provider } from "react-redux";
import { checkLoggedIn } from "./util/session";

const renderApp = preloadedState => {
  const store = configureStore(preloadedState);
  window.state = store.getState;

  ReactDOM.render(<Provider store={store}><App /></Provider>, document.getElementById('root'));
};

(async () => renderApp(await checkLoggedIn()))();




