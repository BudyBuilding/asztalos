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
import { fetchAll } from "./components/reusable/managers/storeManager";
import EditWork from "./components/reusable/editWork";
import authApi from "./components/data/api/authApi";

function App() {
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const navigate = useNavigate();

  useEffect(() => {
    // Ellenőrizzük a localStorage-ban lévő rememberToken-t
    const rememberToken = localStorage.getItem("rememberToken");
    if (rememberToken) {
      authApi.checkTokenApi(rememberToken);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchAll();
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
        <Route path="/workAnalyzer/:workId" element={<WorkAnalyzer />} />
        <Route path="/editWork/:workId" element={<EditWork />} />
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
