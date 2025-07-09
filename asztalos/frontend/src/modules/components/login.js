import React, { useState, useEffect } from "react";
import { Button, Container, InputGroup, FormControl } from "react-bootstrap";

import { useParams, useNavigate } from "react-router-dom";
import authApi from "../../data/api/authApi";

const Login = () => {
  let navigate = useNavigate(); 
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);  
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
      // ha az alap jelszóval lépett be, irány a reset-password
      console.log("password:", password );  
      console.log(password === "Welcome1");
      if (password === "Welcome1") {
        navigate("/reset-password", { replace: true });
        return;
      }
      setIsLoggedIn(true);
      navigate("/dashboard", { replace: true });
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
          <form onSubmit={handleLogin}>
            <h3 className="mb-4">Sign In</h3>

            { !isLoggedIn && errorMessage && (
              <div className="alert alert-danger">{errorMessage}</div>
            )}

            <div className="mb-3">
              <label className="form-label">Username</label>
              <FormControl
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
                <label className="form-label">Password</label>
      <div className="position-relative">
        <FormControl
          type={showPassword ? "text" : "password"}
          placeholder="Enter password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={{ paddingRight: "2.5rem" }} // hely az ikon számára
        />
        <Button
          variant="link"
          onClick={() => setShowPassword(v => !v)}
          style={{
            position: "absolute",
            top: "50%",
            right: "0.75rem",
            transform: "translateY(-50%)",
            padding: 0,
            color: "#6c757d",
          }}
          tabIndex={-1}
        >
          <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`} />
        </Button>
      </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="form-check">
                <input
                  type="checkbox"
                  id="rememberMe"
                  className="form-check-input"
                  checked={rememberMe}
                  onChange={() => setRememberMe(r => !r)}
                />
                <label className="form-check-label" htmlFor="rememberMe">
                  Remember me
                </label>
              </div>
              <Button variant="link" onClick={() => navigate("/forgot-password")}>
                Forgot Password?
              </Button>
            </div>

            {isOffline && (
              <div className="alert alert-warning">
                You are offline. Please check your internet connection.
              </div>
            )}

            <div className="d-grid gap-2">
              <Button type="submit">Sign In</Button>
              <Button variant="link" onClick={() => navigate("/register")}>
                Register
              </Button>
            </div>
          </form>
        )}
      </div>
    </Container>
  );
};

export default Login;
