import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { getClientById, getSelectedClient } from "../data/getters";

const NewWorkModal = ({ show, handleClose, onSubmit }) => {
  const dispatch = useDispatch();

  const [workName, setWorkName] = useState("");

  const handleChange = (e) => {
    const { value } = e.target;
    setWorkName(value);
  };

  const selectedClient = dispatch(getSelectedClient());
  const client = dispatch(getClientById(selectedClient));
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newWork = {
      name: workName,
      client: {
        clientId: selectedClient,
      },
    };
    console.log(newWork);
    onSubmit(newWork);
    handleClose();
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3" controlId="formClientName">
        <Form.Label>Name</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter work name"
          name="name"
          value={workName ? workName : ""}
          onChange={handleChange}
        />
      </Form.Group>

      <Button variant="primary" type="submit">
        Create new work
      </Button>
    </Form>
  );
};

export default NewWorkModal;
