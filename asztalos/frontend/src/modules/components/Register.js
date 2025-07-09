import React, { useState } from "react";
import { Button, Container } from "react-bootstrap";
import authApi from "../../data/api/authApi";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState(""); // <-- username mező helyett
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (password !== repeatPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      await authApi.registerApi({
        userName,     // fontos: backend ezt várja
        name,
        email,
        address,
        password
      });

      setSuccessMessage("Registration successful! You can now log in.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      setErrorMessage("Registration failed. Please check your input.");
      console.error("Register error:", error);
    }
  };

  return (
    <Container className="mt-5 pt-5 w-25">
      <div className="p-5 border rounded Auth-form-container">
        <form className="Auth-form" onSubmit={handleRegister}>
          <div className="Auth-form-content">
            <h3 className="Auth-form-title">Register</h3>

            {errorMessage && (
              <div className="alert alert-danger mt-3">{errorMessage}</div>
            )}
            {successMessage && (
              <div className="alert alert-success mt-3">{successMessage}</div>
            )}

            <div className="form-group mt-3">
              <label>Full Name</label>
              <input
                type="text"
                className="form-control mt-1"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group mt-3">
              <label>Username</label>
              <input
                type="text"
                className="form-control mt-1"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
              />
            </div>

            <div className="form-group mt-3">
              <label>Email</label>
              <input
                type="email"
                className="form-control mt-1"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group mt-3">
              <label>Address</label>
              <input
                type="text"
                className="form-control mt-1"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>

            <div className="form-group mt-3">
              <label>Password</label>
              <input
                type="password"
                className="form-control mt-1"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group mt-3">
              <label>Repeat Password</label>
              <input
                type="password"
                className="form-control mt-1"
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                required
              />
            </div>

            <div className="d-grid gap-2 mt-3">
              <Button type="submit" className="btn btn-success">
                Register
              </Button>
              <Button
                variant="link"
                className="btn btn-link"
                onClick={() => navigate("/login")}
              >
                Back to Login
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Container>
  );
};

export default Register;
