import "./App.css";
import Login from "./components/modules/login";
import Dashboard from "./components/modules/dashboard";
import Navbar from "./components/modules/navigationbar";
import ClientAnalyzer from "./components/reusable/clientAnalyzer";
import WorkAnalyzer from "./components/reusable/workAnalyzer";
import "bootstrap/dist/css/bootstrap.min.css"; // Importáljuk a Bootstrap stíluslapot

function App() {
  return (
    <div className="App mb-10 w-100 h-100 bg-1">
      {/**
       * 
      <Login />
      <Navbar />
      <WorkAnalyzer />
      <ClientAnalyzer />
      <Dashboard />
       */}
    </div>
  );
}

export default App;
