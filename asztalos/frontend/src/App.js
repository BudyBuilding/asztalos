import React, { useEffect } from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Login from "./components/modules/login";
import Dashboard from "./components/modules/dashboard";
import ClientAnalyzer from "./components/reusable/clientAnalyzer";
import WorkAnalyzer from "./components/reusable/workAnalyzer";
import { Provider } from "react-redux";
import store from "./components/data/store/store";
import { useSelector, useDispatch } from "react-redux";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import NewWork from "./components/reusable/newWork";
import ColorSelector from "./components/reusable/colorSelector";
import ModelViewer from "./components/model/ModelViewer";
import { manage } from "./components/reusable/managers/storeManager";

import checkTokenApi from "./components/data/api/authApi";

function App() {
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const navigate = useNavigate();

  useEffect(() => {
    manage();

    // Ellenőrizzük a localStorage-ban lévő rememberToken-t
    const rememberToken = localStorage.getItem("rememberToken");
    if (rememberToken) {
      // Ha van rememberToken, hívjuk meg a checkTokenApi függvényt
      checkTokenApi(rememberToken).then((isValid) => {
        if (isValid) {
          navigate("/dashboard");
        }
      });
    }
  }, [navigate]);

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  }, [isLoggedIn]);

  return (
    <Provider store={store}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/clientAnalyzer/:clientId" element={<ClientAnalyzer />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={isLoggedIn ? <Dashboard /> : <Login />} />
      </Routes>
    </Provider>
  );
}

function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

export default AppWrapper;
