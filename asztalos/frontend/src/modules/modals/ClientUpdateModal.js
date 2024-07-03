// ClientUpdateModal.js
// this is the modal for updating a client

import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { getClientById } from "../../data/getters";
import Loading from "../helpers/Loading";
import ErrorMessage from "../helpers/ErrorMessage";

const ClientUpdateModal = ({ handleClose, clientId, onUpdate }) => {
  const dispatch = useDispatch();
  const [isLoading, setLoading] = useState(true);
  const [clientData, setClientData] = useState(null);
  const [showError, setShowError] = useState(false);
  const [errorOnSubmit, setErrorOnSubmit] = useState(false);
  const [updatedClientData, setUpdatedClientData] = useState({
    name: "",
    telephone: "",
    address: "",
  });

  useEffect(() => {
    // if we cannot load in 10sec then it will give an error
    const timeout = setTimeout(() => {
      setShowError(true);
    }, 10000);

    // if we can load a clientData then we have to save it
    async function fetchClientData() {
      try {
        const data = await dispatch(getClientById(clientId + 0));
        setClientData(data);
        setUpdatedClientData({
          name: data.name,
          telephone: data.telephone,
          address: data.address,
        });
        setLoading(false);
        clearTimeout(timeout);
      } catch (error) {
        console.error("Error fetching client data:", error);
        setLoading(false);
        setShowError(true);
      }
    }

    fetchClientData();

    return () => clearTimeout(timeout);
  }, [clientId, dispatch]);

  // on changing or name or address or phone we have to save it
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedClientData({ ...updatedClientData, [name]: value });
  };

  // submiting
  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedClient = {
      ...clientData,
      name: updatedClientData.name,
      telephone: updatedClientData.telephone,
      address: updatedClientData.address,
    };

    // check if the user changed anything, if not then gives an error
    if (
      updatedClient.name === clientData.name &&
      updatedClient.telephone === clientData.telephone &&
      updatedClient.address === clientData.address
    ) {
      setErrorOnSubmit(true);
    } else {
      onUpdate(updatedClient);
      handleClose();
    }
  };
  if (!clientData) {
    return null;
  }

  return (
    <>
      <Modal
        show={true}
        onHide={() => {}}
        backdrop="static"
        keyboard={false}
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Update Client
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {showError ? (
            <ErrorMessage message="Error: Unable to fetch client data." />
          ) : isLoading ? (
            <Loading />
          ) : (
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="formClientName">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter client name"
                  name="name"
                  value={updatedClientData.name || ""}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formClientTel">
                <Form.Label>Telephone</Form.Label>
                <Form.Control
                  type="tel"
                  placeholder="Enter client telephone"
                  name="telephone"
                  value={updatedClientData.telephone || ""}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formClientAddress">
                <Form.Label>Address</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter client address"
                  name="address"
                  value={updatedClientData.address || ""}
                  onChange={handleChange}
                />
              </Form.Group>
              <Button
                variant="primary"
                type="submit"
                style={{ cursor: "pointer" }}
              >
                Update Client
              </Button>
            </Form>
          )}{" "}
          {errorOnSubmit && (
            <ErrorMessage message="Error: No changes were made." />
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ClientUpdateModal;
