import React, { useState } from "react";
import { Button, Container } from "react-bootstrap";
import authApi from "../../data/api/authApi";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();



    try {
      await authApi.forgotPasswordApi(email);
      setMessage("If an account with that email exists, a reset link was sent.");
    } catch (error) {
      setMessage("Something went wrong. Please try again later.");
      console.error("Forgot password error:", error);
    }
  };

  return (
    <Container className="mt-5 pt-5 w-25">
      <div className="p-5 border rounded Auth-form-container">
        <form className="Auth-form" onSubmit={handleSubmit}>
          <div className="Auth-form-content">
            <h3 className="Auth-form-title">Forgot Password</h3>

            {message && (
              <div className="alert alert-info mt-3">{message}</div>
            )}

            <div className="form-group mt-3">
              <label>Email address</label>
              <input
                type="email"
                className="form-control mt-1"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="d-grid gap-2 mt-3">
              <Button type="submit" className="btn btn-primary">
                Send Reset Link
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Container>
  );
};

export default ForgotPassword;
