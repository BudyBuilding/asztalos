// Login.js
// the Login class handles the login page and the methods

import React, { useState, useEffect } from "react";
import { Form, Button, Container } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { login, loginStart } from "../../data/store/actions/storeFunctions";
import authApi from "../../data/api/authApi";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // Állapot a hibaüzenet tárolására
  const dispatch = useDispatch();

  // Bejelentkezési függvény
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await authApi.loginApi(username, password, rememberMe); // API hívás a bejelentkezéshez
      // Sikeres bejelentkezés esetén töröljük a hibaüzenetet
      setErrorMessage("");
    } catch (error) {
      // Sikertelen bejelentkezés esetén beállítjuk a hibaüzenetet
      setErrorMessage("Invalid username or password.");
      console.error("Login failed:", error.message); // Részletes hibaüzenet a konzolra
    }
  };

  // Remember me toggle függvény
  const handleRememberMe = () => {
    setRememberMe(!rememberMe);
  };

  // Hibaüzenet eltüntetése 5 másodperc után
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  return (
    <Container className="mt-5 pt-5 w-25">
      <div className="p-5 border rounded Auth-form-container">
        <form className="Auth-form" onSubmit={handleLogin}>
          <div className="Auth-form-content">
            <h3 className="Auth-form-title">Sign In</h3>
            <div className="form-group mt-3">
              <label>Username</label>
              <input
                type="text"
                className="form-control mt-1"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="form-group mt-3">
              <label>Password</label>
              <input
                type="password"
                className="form-control mt-1"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="form-group mt-3">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={handleRememberMe}
              />
              <label className="ms-2">Remember me</label>
            </div>
            {errorMessage && (
              <div className="alert alert-danger mt-3" role="alert">
                {errorMessage}
              </div>
            )}
            <div className="d-grid gap-2 mt-3">
              <Button type="submit" className="btn btn-primary">
                Sign In
              </Button>
              <Button variant="link" className="btn btn-link">
                Forget Password?
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Container>
  );
};

export default Login;
