import React from "react";
import { BrowserRouter } from "react-router-dom";
import { createRoot } from "react-dom/client";
import { Provider } from 'react-redux';
import { store } from './redux/store.jsx';

import App from "./App.jsx";
import "./index.css";
import "./App.css";

createRoot(document.getElementById("root")).render(
  <>
    <BrowserRouter>
      <Provider store={store}>
        <App />
      </Provider>
    </BrowserRouter>
  </>
);
