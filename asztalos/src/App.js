import React from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Login from "./components/modules/login";
import Dashboard from "./components/modules/dashboard";
import Navbar from "./components/modules/navigationbar";
import ClientAnalyzer from "./components/reusable/clientAnalyzer"; // Módosítva
import WorkAnalyzer from "./components/reusable/workAnalyzer";
import NewWork from "./components/reusable/newWork";
import { Provider } from "react-redux";
import store from "./components/data/store/store";
import { useSelector } from "react-redux";

function App() {
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);

  return (
    <Provider store={store}>
      <div className="App mb-5 w-100 h-100 bg-1">
        <div className="bg-3 bg-info h-100"></div>
        <Navbar />
        {isLoggedIn ? <Dashboard /> : <Login />}
      </div>
    </Provider>
  );
}

export default App;
