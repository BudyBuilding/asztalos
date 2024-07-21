import React, { useEffect, useState } from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Login from "./modules/components/Login";
import UserDashboard from "./modules/components/UserDashboard";
import ClientAnalyzer from "./modules/components/ClientAnalyzer";
import WorkAnalyzer from "./modules/components/WorkAnalyzer";
import AdminDashboard from "./modules/adminFiles/AdminDashboard";
import { Provider, useDispatch, useSelector } from "react-redux";
import store from "./data/store/store";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { fetchAll, fetchUsers } from "./data/storeManager";
import EditWork from "./modules/components/EditWork";
import authApi from "./data/api/authApi";
import { getUser } from "./data/getters";
import SideNavigation from "./modules/components/SideNavigation";
import UsersPage from "./modules/components/UsersPage";
import ClientsPage from "./modules/components/ClientsPage";
import WorksPage from "./modules/components/WorksPage";
import ColorsPage from "./modules/components/ColorsPage";
import SettingsPage from "./modules/components/SettingsPage";
import ScriptsPage from "./modules/components/ScriptsPage";

function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const checkToken = async () => {
      const rememberToken = localStorage.getItem("rememberToken");
      if (rememberToken) {
        await authApi.checkTokenApi(rememberToken);
      }
    };
    checkToken();
  }, []);

  useEffect(() => {
    const handleAuth = async () => {
      if (isLoggedIn) {
        const currentuser = await dispatch(getUser());
        setUserRole(currentuser.role);

        if (currentuser.role === "admin") {
          await fetchUsers();
        }
        await fetchAll();
        navigate("/dashboard");
      } else {
        navigate("/login");
      }
    };

    handleAuth();
  }, [isLoggedIn]);

  return (
    <Provider store={store}>
      <div className="app-container">
        {isLoggedIn && <SideNavigation />}
        <div className="main-content">
          <Routes>
            <Route
              path="/dashboard"
              element={
                userRole === "admin" ? <AdminDashboard /> : <UserDashboard />
              }
            />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/scripts" element={<ScriptsPage />} />
            <Route path="/colors" element={<ColorsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/works" element={<WorksPage />} />
            <Route
              path="/clientAnalyzer/:clientId"
              element={<ClientAnalyzer />}
            />
            <Route path="/workAnalyzer/:workId" element={<WorkAnalyzer />} />
            <Route path="/editWork/:workId" element={<EditWork />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={isLoggedIn ? <UserDashboard /> : <Login />}
            />
          </Routes>
        </div>
      </div>
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
