// NewClientModal.js
// this function sends a new client to the database

import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { useDispatch } from "react-redux";
import clientApi from "../../data/api/clientApi";
import ErrorMessage from "../helpers/ErrorMessage";

function NewClientModal({ onClose }) {
  const dispatch = useDispatch();
  const [clientName, setClientName] = useState("");
  const [clientTel, setClientTel] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [error, setError] = useState("");

  // these handles all the changes
  const handleNameChange = (e) => {
    setClientName(e.target.value);
  };

  const handleTelChange = (e) => {
    setClientTel(e.target.value);
  };

  const handleAddressChange = (e) => {
    setClientAddress(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // we are checking is the attributes are empty or not, if yes it must give an error
    if (!clientName || !clientTel || !clientAddress) {
      setError("Kérlek töltsd ki az összes mezőt.");
      return;
    }

    const newClientData = {
      name: clientName,
      telephone: clientTel,
      address: clientAddress
    };

    // trying to save the new client, if there is any error it should write it out
    try {
      await dispatch(clientApi.createClientApi(newClientData));
      onClose();
    } catch (error) {
      setError("Belső szerver hiba, kérlek próbáld újra.");
    }
  };

  return (
    <div className="modal-body">
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="formClientName">
          <Form.Label>Név</Form.Label>
          <Form.Control
            type="text"
            placeholder="Kliens neve"
            value={clientName}
            onChange={handleNameChange}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formClientTel">
          <Form.Label>Telefonszám</Form.Label>
          <Form.Control
            type="tel"
            placeholder="Kliens telefonszáma"
            value={clientTel}
            onChange={handleTelChange}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formClientAddress">
          <Form.Label>Cím</Form.Label>
          <Form.Control
            type="text"
            placeholder="Kliens címe"
            value={clientAddress}
            onChange={handleAddressChange}
          />
        </Form.Group>
        {error && <ErrorMessage message={error} />}
        <Button variant="primary" type="submit">
          Kliens hozzáadása
        </Button>
      </Form>
    </div>
  );
}

export default NewClientModal;
