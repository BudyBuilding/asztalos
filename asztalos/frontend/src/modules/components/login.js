import React, { useState, useEffect } from "react";
import { Button, Container } from "react-bootstrap";
import authApi from "../../data/api/authApi";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isTokenChecked, setIsTokenChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (isOffline) {
      setErrorMessage("No network connection. Please check your internet.");
      return;
    }

    try {
      await authApi.loginApi(username, password, rememberMe);
      setErrorMessage("");
      setIsLoggedIn(true);
    } catch (error) {
      setErrorMessage("Invalid username or password.");
      console.error("Login failed:", error.message);
    }
  };

  const handleRememberMe = () => {
    setRememberMe(!rememberMe);
  };

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // Token ellenőrzés komponens betöltésekor
  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = localStorage.getItem("userToken");
        if (token) {
          await authApi.checkTokenApi(token);
          setIsLoggedIn(true);
        }
      } catch (error) {
        if (error.response && error.response.status === 401) {
          console.log("Unauthorized: Invalid token.");
        } else {
          console.error("Token check failed:", error.message);
        }
      } finally {
        setIsTokenChecked(true);
      }
    };

    checkToken();
  }, []);

  // Csak akkor jelenítünk meg hibaüzenetet, ha a token ellenőrzése befejeződött
  return (
    <Container className="mt-5 pt-5 w-25">
      <div className="p-5 border rounded Auth-form-container">
        {!isTokenChecked ? (
          <div>Loading...</div> // Türelmesen várunk a token ellenőrzés befejezéséig
        ) : (
          <form className="Auth-form" onSubmit={handleLogin}>
            <div className="Auth-form-content">
              <h3 className="Auth-form-title">Sign In</h3>
              {!isLoggedIn &&
                errorMessage && ( // Csak ha nem vagyunk bejelentkezve, és van hiba
                  <div className="alert alert-danger mt-3" role="alert">
                    {errorMessage}
                  </div>
                )}
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
              {isOffline && (
                <div className="alert alert-warning mt-3" role="alert">
                  You are offline. Please check your internet connection.
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
        )}
      </div>
    </Container>
  );
};

export default Login;
