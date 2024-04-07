import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css"; // Importáljuk a Bootstrap stíluslapot
import Login from "./components/modules/login";
import Dashboard from "./components/modules/dashboard";
import Navbar from "./components/modules/navigationbar";
import ClientAnalyzer from "./components/reusable/clientAnalyzer";
import WorkAnalyzer from "./components/reusable/workAnalyzer";
import NewWork from "./components/reusable/newWork";
import { Provider } from "react-redux"; // Provider importálása a react-redux csomagból
import store from "./components/data/store/store"; // Redux store importálása
import { useSelector } from "react-redux"; // useSelector importálása a react-redux csomagból

function App() {
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);

  return (
    <Provider store={store}>
      <div className="App mb-5 w-100 h-100 bg-1">
        <div className="bg-3 bg-info h-100"></div>
        <Navbar />
        {isLoggedIn ? <Dashboard /> : <Login />}
      </div>

      {/**
      <Dashboard />
      <Navbar />
      <Login />
      <WorkAnalyzer />
      <ClientAnalyzer />
      <NewWork />
    */}
    </Provider>
  );
}

export default App;
