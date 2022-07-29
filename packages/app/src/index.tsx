import * as React from "react";
import ReactDOM from "react-dom";

import reportWebVitals from "./reportWebVitals";
import * as serviceWorker from "./serviceWorker";

import { BrowserRouter, HashRouter } from "react-router-dom";
import { CSSReset } from "@chakra-ui/react";
import { nameToChainId } from "@qfi/hooks";

import { App } from "./App";
import { DappProvider } from "./context/DappContext";

const DEFAULT_CHAIN_ID = nameToChainId("xdai"); // Used to switch to if the user is on an unsupported network
console.log(DEFAULT_CHAIN_ID)

declare global {
  interface WindowEventMap {
    "local-storage": CustomEvent;
  }
}

ReactDOM.render(
  <React.StrictMode>
    <CSSReset />
    <DappProvider>
      <HashRouter>
        <App />
      </HashRouter>
    </DappProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
