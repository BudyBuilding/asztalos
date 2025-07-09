// NewWorkModal.js
// this function handles the creating of a new work

import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { getClientById, getSelectedClient } from "../../data/getters";
import ErrorMessage from "../helpers/ErrorMessage";

const NewWorkModal = ({ show, handleClose, onSubmit }) => {
  const dispatch = useDispatch();
  const selectedClient = dispatch(getSelectedClient());
  const [workName, setWorkName] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { value } = e.target;
    setWorkName(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // we have to check if the name of the work is empty or not, if it is then we have to show the error
    if (!workName) {
      setError("Please enter a work name.");
      return;
    }

    const newWork = {
      name: workName,
      client: {
        clientId: selectedClient,
      },
    };
    // trying to save the new work, if there is any error it should write it out
    try {
      console.log(newWork);
      onSubmit(newWork);
      handleClose();
    } catch (error) {
      console.error("Error while creating new work:", error);
      setError("Internal server error, please try again later.");
    }
  };

  return (
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formWorkName">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter work name"
              name="name"
              value={workName}
              onChange={handleChange}
            />
          </Form.Group>
          {error && <ErrorMessage message={error} />}

          <Button variant="primary" type="submit">
            Create new work
          </Button>
        </Form>
  );
};

export default NewWorkModal;
