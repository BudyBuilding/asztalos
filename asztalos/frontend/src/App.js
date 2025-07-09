import React, { useEffect, useState } from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Login from "./modules/components/login.js";
import Register from "./modules/components/Register.js";
import ForgotPassword from "./modules/components/ForgotPassword.js";
import ResetPassword from "./modules/components/ResetPassword.js";
import UserDashboard from "./modules/components/UserDashboard";
import AdminDashboard from "./modules/adminFiles/AdminDashboard";
import CompanyDashboard from "./modules/components/companyComponents/CompanyDashboard";
import ClientAnalyzer from "./modules/components/clientAnalyzer.js";
import UserAnalyzer from "./modules/components/companyComponents/userAnalyzer.js";
import CompanyWorkAnalyzer from "./modules/components/companyComponents/CompanyWorkAnalyzer.js";
import WorkAnalyzer from "./modules/components/workAnalyzer.js";
import { Provider, useDispatch, useSelector } from "react-redux";
import store from "./data/store/store";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";
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
import ScrollToTop from "./modules/helpers/ScrollToTop.js";
import TopNavigationBar from "./modules/components/TopNavigation.js";
import TableViewer from "./modules/components/tableViewer.js";
import EmployeePage from "./modules/components/companyComponents/EmployeePage.js";

function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const [currentUser, setCurrentUser] = useState(null);
  const [isTokenChecked, setIsTokenChecked] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(true);

  const PUBLIC_ROUTES = ["/login", "/forgot-password",  "/reset-password"];

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
    if (!isTokenChecked) return;

    if (isLoggedIn) {
      // 1) lekérjük a user-t, feltöltünk minden adatot...
      const user = await dispatch(getUser());
      setCurrentUser(user);
      if (user.role === "admin" || user.role === "companyAdmin" || user.role === "companyUser") {
        await fetchUsers();
      }
      await fetchAll();

      // 2) csak a gyökér útvonalon toljuk át automatikusan a dashboardra:
      if (location.pathname === "/") {
        navigate("/dashboard", { replace: true });
      }
      // **ÉS** ne redirectelj se /login-ról, se /reset-password-ről!
    } else {
      // ha nem vagyunk bent, és nem vagyunk épp egy publikus oldalon, toljuk a loginra
      if (!PUBLIC_ROUTES.includes(location.pathname)) {
        navigate("/login", { replace: true });
      }
    }
  };

  handleAuth();
}, [isLoggedIn, isTokenChecked, location.pathname]);

  if (!isTokenChecked) {
    return <Loading />;
  }

  return (
    <div
      className="app-container"
      style={{
        backgroundColor: "#F3F5F7",
        display: "flex",
        flexDirection: "column",
        minHeight: "150vh",
      }}
    >
      {isLoggedIn && 
        location.pathname !== "/reset-password" && 
        location.pathname !== "/login" && 
        (
      <TopNavigationBar />)}

      <div className="content-wrapper" style={{ display: "flex", flex: 1 }}>
        {isLoggedIn && 
          location.pathname !== "/reset-password" && 
          location.pathname !== "/login" && 
          (
          <SideNavigation
            isOpen={isNavOpen}
            onToggle={() => setIsNavOpen((open) => !open)}
          />
        )}

        <div
          className="main-content p-0 m-0 ms-5 me-5 mt-2 overflow-hidden flex-fill d-flex flex-column"
          style={{ flex: 1, overflow: "hidden" }}
        >
          <Routes>
            <Route
              path="/dashboard"
              element={
                currentUser?.role === "user" ? (
                  <UserDashboard />
                ) : currentUser?.role === "admin" ? (
                  <UserDashboard />
                ) : currentUser?.role === "companyAdmin" || currentUser?.role === "companyUser" ? (
                  <CompanyDashboard />
                ) : (
                  <div>Unauthorized</div>
                )
              }
            />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/scripts" element={<ScriptsPage />} />
            <Route path="/scripts/:scriptId" element={<ScriptsPage />} />
            <Route path="/colors" element={<ColorsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/employee" element={<EmployeePage />} />
            <Route path="/works" element={<WorksPage />} />
            <Route path="/clientAnalyzer/:clientId" element={<ClientAnalyzer />} />
            <Route path="/userAnalyzer/:userId" element={<UserAnalyzer />} />
            <Route
              path="/workAnalyzer/:workId"
              element={
                currentUser?.role === "user" ||
                currentUser?.role === "admin" ? (
                  <WorkAnalyzer />
                ) : currentUser?.role === "companyAdmin" || currentUser?.role === "companyUser" ? (
                  <CompanyWorkAnalyzer />
                ) : (
                  <div>Unauthorized</div>
                )
              }
            />
            <Route path="/editWork/:workId" element={<EditWork />} />
            <Route path="/TableViewer/:workId" element={<TableViewer />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              path="/"
              element={isLoggedIn ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}
            />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function AppWrapper() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <ScrollToTop />
        <App />
      </BrowserRouter>
    </Provider>
  );
}

export default AppWrapper;
