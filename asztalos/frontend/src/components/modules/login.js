import React, { useState, useEffect } from "react";
import { Form, Button, Container } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { login, loginStart } from "../data/store/actions/actions";
import { loginApi } from "../data/firebase/apiService";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const storedUsername = localStorage.getItem("rememberMeUsername");
    const storedPassword = localStorage.getItem("rememberMePassword");
    const storedRememberMe = localStorage.getItem("rememberMe") === "true";

    if (storedUsername && storedPassword && storedRememberMe) {
      setUsername(storedUsername);
      setPassword(storedPassword);
      setRememberMe(storedRememberMe);
      dispatch(login({ username: storedUsername, password: storedPassword }));
    }
  }, []);
  /*
  const handleLogin = (e) => {
    e.preventDefault();
    dispatch(login({ username, password }));
  };*/

  const handleLogin = (e) => {
    e.preventDefault();
    loginApi(username, password, rememberMe); // API hívás a bejelentkezéshez
    dispatch(login({ username, password }));
  };

  const handleRememberMe = () => {
    setRememberMe(!rememberMe);
  };

  useEffect(() => {
    if (rememberMe) {
      localStorage.setItem("rememberMeUsername", username);
      localStorage.setItem("rememberMePassword", password);
      localStorage.setItem("rememberMe", "true");
    } else {
      localStorage.removeItem("rememberMeUsername");
      localStorage.removeItem("rememberMePassword");
      localStorage.removeItem("rememberMe");
    }
  }, [rememberMe]);

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
            <div className="d-grid gap-2 mt-3">
              <button type="submit" className="btn btn-primary">
                Submit
              </button>
            </div>
            <p className="forgot-password text-right mt-2">
              <a href="#">Forgot password?</a>
            </p>
          </div>
        </form>
        <div className="d-grid gap-2 mt-3">
          <Button variant="secondary" onClick={handleRememberMe}>
            {rememberMe ? "Forget Me" : "Remember Me"}
          </Button>
        </div>
      </div>
    </Container>
  );
};

export default Login;
