import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { addClient } from "../data/api/apiService"; // Az addClient függvény importálása az apiService-ből
import clientApi from "../data/api/clientApi";

function NewClient({ onClose }) {
  const [clientName, setClientName] = useState("");
  const [clientTel, setClientTel] = useState("");
  const [clientAddress, setClientAddress] = useState("");

  const dispatch = useDispatch();

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

    const newClientData = {
      name: clientName,
      telephone: clientTel,
      address: clientAddress,
    };

    try {
      console.log("creating new client");
      dispatch(clientApi.createClientApi(newClientData));
      onClose(); // A modális ablak bezárása
    } catch (error) {
      console.error("Error while adding client:", error);
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
        <Button variant="primary" type="submit">
          Add Client
        </Button>
      </Form>
    </div>
  );
}

export default NewClient;
