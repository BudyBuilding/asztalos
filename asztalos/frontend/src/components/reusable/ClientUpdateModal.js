import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { getClientById } from "../data/getters";
const ClientUpdateModal = ({ handleClose, clientId, onUpdate }) => {
  const dispatch = useDispatch();
  const [clientData, setClientData] = useState(null);
  const [updatedClientData, setUpdatedClientData] = useState({
    name: "",
    telephone: "",
    address: "",
  });

  useEffect(() => {
    async function fetchClientData() {
      const data = await dispatch(getClientById(clientId));
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
    const updatedClient = {
      ...clientData,
      name: updatedClientData.name,
      telephone: updatedClientData.telephone,
      address: updatedClientData.address,
    };
    console.log(updatedClient);
    onUpdate(updatedClient);
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
              value={updatedClientData.name ? updatedClientData.name : " "}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formClientTel">
            <Form.Label>Telephone</Form.Label>
            <Form.Control
              type="tel"
              placeholder="Enter client telephone"
              name="telephone"
              value={
                updatedClientData.telephone ? updatedClientData.telephone : " "
              }
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formClientAddress">
            <Form.Label>Address</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter client address"
              name="address"
              value={
                updatedClientData.address ? updatedClientData.address : " "
              }
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
