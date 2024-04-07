import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css"; // Importáljuk a Bootstrap stíluslapot
import Login from "./components/modules/login";
import Dashboard from "./components/modules/dashboard";
import Navbar from "./components/modules/navigationbar";
import ClientAnalyzer from "./components/reusable/clientAnalyzer";
import WorkAnalyzer from "./components/reusable/workAnalyzer";
import NewWork from "./components/reusable/newWork";
function App() {
  return (
    <div className="App mb-5 w-100 h-100 bg-1">
      <div className="bg-3 bg-info h-100"></div>
      {/**
       * 
       <Navbar />
       <Login />
       <WorkAnalyzer />
       <ClientAnalyzer />
       <NewWork />
      */}
      <Dashboard />
    </div>
  );
}

export default App;
