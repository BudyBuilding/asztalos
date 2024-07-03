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
      setError("Please fill out all fields.");
      return;
    }

    const newClientData = {
      name: clientName,
      telephone: clientTel,
      address: clientAddress,
    };

    // trying to save the new client, if there is any error it should write it out
    try {
      await dispatch(clientApi.createClientApi(newClientData));
      onClose();
    } catch (error) {
      setError("Internal server error, please try again later.");
    }
  };

  return (
    <div className="modal-body">
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="formClientName">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter client name"
            value={clientName}
            onChange={handleNameChange}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formClientTel">
          <Form.Label>Telephone</Form.Label>
          <Form.Control
            type="tel"
            placeholder="Enter client telephone"
            value={clientTel}
            onChange={handleTelChange}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formClientAddress">
          <Form.Label>Address</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter client address"
            value={clientAddress}
            onChange={handleAddressChange}
          />
        </Form.Group>
        {error && <ErrorMessage message={error} />}
        <Button variant="primary" type="submit">
          Add Client
        </Button>
      </Form>
    </div>
  );
}

export default NewClientModal;
