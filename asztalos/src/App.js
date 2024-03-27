import "./App.css";
import Login from "./components/modules/login";
import Dashboard from "./components/modules/dashboard";
import Navbar from "./components/modules/navigationbar";
import Clientanalyzer from "./components/reusable/Client-analyzer";

import "bootstrap/dist/css/bootstrap.min.css"; // Importáljuk a Bootstrap stíluslapot

function App() {
  return (
    <div className="App">
      {/*

     <Login />  
*/}
      <Navbar />
      <Clientanalyzer />
      {/*
      <Dashboard />
       */}
    </div>
  );
}

export default App;
