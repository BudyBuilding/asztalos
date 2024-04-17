import React from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Login from "./components/modules/login";
import Dashboard from "./components/modules/dashboard";
import ClientAnalyzer from "./components/reusable/clientAnalyzer";
import WorkAnalyzer from "./components/reusable/workAnalyzer";
import { Provider } from "react-redux";
import store from "./components/data/store/store";
import { useSelector, useDispatch } from "react-redux";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { selectClient } from "./components/data/store/actions/actions";
import NewWork from "./components/reusable/newWork";
import ColorSelector from "./components/reusable/colorSelector";

function App() {
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  //<WorkAnalyzer />

  return (
    <Provider store={store}>
      <ColorSelector />
      <NewWork />
      <BrowserRouter>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route
            path="/clientAnalyzer/:clientId"
            element={<ClientAnalyzer />}
          />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={isLoggedIn ? <Dashboard /> : <Login />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
