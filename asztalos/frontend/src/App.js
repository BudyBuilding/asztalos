import React, { useEffect, useState } from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Login from "./modules/components/login.js";
import UserDashboard from "./modules/components/UserDashboard";
import ClientAnalyzer from "./modules/components/clientAnalyzer.js";
import WorkAnalyzer from "./modules/components/workAnalyzer.js";
import AdminDashboard from "./modules/adminFiles/AdminDashboard";
import { Provider, useDispatch, useSelector } from "react-redux";
import store from "./data/store/store";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { fetchAll, fetchUsers } from "./data/storeManager";
import EditWork from "./modules/components/editWork.js";
import authApi from "./data/api/authApi";
import { getUser } from "./data/getters";
import SideNavigation from "./modules/components/SideNavigation";
import UsersPage from "./modules/components/UsersPage";
import ClientsPage from "./modules/components/ClientsPage";
import WorksPage from "./modules/components/WorksPage";
import ColorsPage from "./modules/components/ColorsPage";
import SettingsPage from "./modules/components/SettingsPage";
import ScriptsPage from "./modules/components/ScriptsPage";
import Loading from "./modules/helpers/Loading.js";
import TopNavigationBar from "./modules/components/TopNavigation.js";
function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const [userRole, setUserRole] = useState(null);
  const [isTokenChecked, setIsTokenChecked] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      const rememberToken = localStorage.getItem("rememberToken");
      if (rememberToken) {
        try {
          await authApi.checkTokenApi(rememberToken);
        } catch (error) {
          console.error("Token invalid or expired:", error.message);
        }
      }
      setIsTokenChecked(true);
    };
    checkToken();
  }, []);

  useEffect(() => {
    const handleAuth = async () => {
      if (isTokenChecked) {
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
      }
    };

    handleAuth();
  }, [isLoggedIn, isTokenChecked]);
  if (!isTokenChecked) {
    return (
      <div>
        <Loading />
      </div>
    );
  }

  return (
<Provider store={store}>
  <div className="app-container" style={{ backgroundColor: "#F3F5F7", display: "flex", flexDirection: "column", minHeight: "120vh"}}>
    
    {/* Felső navigációs sáv */}
    {isLoggedIn && <TopNavigationBar />}

    {/* Tartalom konténer: SideNavigation + main-content egymás mellett */}
    <div className="content-wrapper" style={{ display: "flex", flex: 1 }}>
      
      {/* Oldalsó navigáció */}
      {isLoggedIn && <SideNavigation style={{ width: "250px", flexShrink: 0 }} />}
      
      {/* Fő tartalom */}
      <div className="main-content p-0 m-0 ms-5 me-5 mt-2 overflow-hidden" style={{ flexGrow: 1 }}>
        <Routes>
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/scripts" element={<ScriptsPage />} />
          <Route path="/colors" element={<ColorsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/works" element={<WorksPage />} />
          <Route path="/clientAnalyzer/:clientId" element={<ClientAnalyzer />} />
          <Route path="/workAnalyzer/:workId" element={<WorkAnalyzer />} />
          <Route path="/editWork/:workId" element={<EditWork />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={isLoggedIn ? <UserDashboard /> : <Login />} />
        </Routes>
      </div>

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
