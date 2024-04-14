import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { addClient } from "../data/firebase/apiService"; // importáljuk az addClient függvényt az apiService-ből

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
      tel: clientTel,
      address: clientAddress,
    };

    try {
      const addedClient = await dispatch(addClient(newClientData));
      setClientName("");
      setClientTel("");
      setClientAddress("");
      onClose();
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
