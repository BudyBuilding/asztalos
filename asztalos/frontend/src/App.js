import React, { useEffect } from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Login from "./modules/components/Login";
import UserDashboard from "./modules/components/UserDashboard";
import ClientAnalyzer from "./modules/components/ClientAnalyzer";
import WorkAnalyzer from "./modules/components/WorkAnalyzer";
import AdminDashboard from "./modules/adminFiles/AdminDashboard"; // Importáljuk az AdminDashboard komponenst
import { Provider, useDispatch, useSelector } from "react-redux";
import store from "./data/store/store";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { fetchAll } from "./data/storeManager";
import EditWork from "./modules/components/EditWork";
import authApi from "./data/api/authApi";
import { getUser } from "./data/getters";

function App() {
  const dispatch = useDispatch();
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
      const currentuser = dispatch(getUser());
      console.log(currentuser);
      fetchAll();
      if (currentuser.role == "admin") {
        navigate("/adminDashboard"); // Admin esetén az adminDashboard-ra navigálunk
      } else {
        navigate("/userDashboard"); // Normál felhasználó esetén a userDashboard-ra navigálunk
      }
    } else {
      navigate("/login");
    }
  }, [isLoggedIn]);

  return (
    <Provider store={store}>
      <Routes>
        <Route path="/adminDashboard" element={<AdminDashboard />} />{" "}
        <Route path="/userDashboard" element={<UserDashboard />} />
        <Route path="/clientAnalyzer/:clientId" element={<ClientAnalyzer />} />
        <Route path="/workAnalyzer/:workId" element={<WorkAnalyzer />} />
        <Route path="/editWork/:workId" element={<EditWork />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={isLoggedIn ? <UserDashboard /> : <Login />} />
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
