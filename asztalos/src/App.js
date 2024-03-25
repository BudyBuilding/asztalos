import './App.css';
import Login from "./components/modules/login";
import Dashboard from "./components/modules/dashboard";
import Navbar from "./components/modules/navigationbar";

import 'bootstrap/dist/css/bootstrap.min.css'; // Importáljuk a Bootstrap stíluslapot

function App() {
  return (
    <div className="App">
{/*

     <Login />  
*/}
    <Navbar/>

    <Dashboard/>
    </div>
  );
}

export default App;
