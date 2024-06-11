import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { getClientFromStore, updateClient } from "../data/firebase/apiService";

const ClientUpdateModal = ({ handleClose, clientId }) => {
  const dispatch = useDispatch();
  const [clientData, setClientData] = useState(null);
  const [updatedClientData, setUpdatedClientData] = useState({
    name: "",
    telephone: "",
    address: "",
  });

  useEffect(() => {
    async function fetchClientData() {
      const data = await dispatch(getClientFromStore(clientId));
      console.log(data);
      setClientData(data);
      setUpdatedClientData({
        name: data.name,
        telephone: data.telephone,
        address: data.address,
      });
    }
    fetchClientData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedClientData({ ...updatedClientData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await dispatch(updateClient(clientId, updatedClientData));
    handleClose();
  };

  if (!clientData) {
    return null; // or a loading spinner
  }

  return (
    <Modal show={true} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Update Client</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formClientName">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter client name"
              name="name"
              value={updatedClientData.name}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formClientTel">
            <Form.Label>Telephone</Form.Label>
            <Form.Control
              type="tel"
              placeholder="Enter client telephone"
              name="telephone"
              value={updatedClientData.telephone}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formClientAddress">
            <Form.Label>Address</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter client address"
              name="address"
              value={updatedClientData.address}
              onChange={handleChange}
            />
          </Form.Group>
          <Button variant="primary" type="submit">
            Update Client
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ClientUpdateModal;
