import React, { useState } from "react";
import { Container, Form, Button, Alert } from "react-bootstrap";
import { useNavigate, useSearchParams } from "react-router-dom";
import authApi from "../../data/api/authApi";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState("danger");
  const [submitting, setSubmitting] = useState(false);

// ResetPassword.js
const handleSubmit = async (e) => {
  e.preventDefault();

  // 1) Welcome1 tilos
  if (newPassword === "Welcome1") {
    setVariant("danger");
    setMessage('A "Welcome1" jelszó használata nem engedélyezett, kérlek válassz másikat.');
    return;
  }
  // 2) jelszó-egyeztetés
  if (newPassword !== confirmPassword) {
    setVariant("danger");
    setMessage("A két jelszó nem egyezik, kérlek ellenőrizd újra.");
    return;
  }

  setSubmitting(true);
  try {
    const response = await authApi.resetPasswordApi({ token, newPassword });

    // Ha a backenden JSON-ben küldöd a success/message párost:
    const { success, message: serverMsg } = response.data;

    if (response.status === 409 || success === false) {
      // 409 esetén vagy success:false
      setVariant("danger");
      setMessage(serverMsg || "Az új jelszó nem egyezhet meg a korábbi jelszóval.");
    } else {
      // sikeres mentés
      setVariant("success");
      setMessage("A jelszó sikeresen megváltozott. Átirányítás a bejelentkező oldalra…");
      setTimeout(() => navigate("/login"), 2000);
    }
  } catch (err) {
    console.error("ResetPassword error:", err);
    // ha axios exception, megnézzük a status-t
    const status = err.response?.status;
    const serverMsg = err.response?.data?.message;
    if (status === 409) {
      setVariant("danger");
      setMessage(serverMsg || "Az új jelszó nem egyezhet meg a korábbi jelszóval.");
    } else {
      setVariant("danger");
      setMessage("Hiba történt, kérlek próbáld újra később.");
    }
  } finally {
    setSubmitting(false);
  }
};


  return (
    <Container className="mt-5 pt-5 w-25">
      <div className="p-5 border rounded Auth-form-container">
        <h3 className="mb-4">Reset Password</h3>
        {message && <Alert variant={variant}>{message}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="newPassword">
            <Form.Label>Új jelszó</Form.Label>
            <Form.Control
              type="password"
              placeholder="Írd be az új jelszót"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="confirmPassword">
            <Form.Label>Új jelszó ismét</Form.Label>
            <Form.Control
              type="password"
              placeholder="Írd be újra az új jelszót"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </Form.Group>

          <div className="d-grid">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Mentés…" : "Jelszó mentése"}
            </Button>
          </div>
        </Form>
      </div>
    </Container>
  );
};

export default ResetPassword;
