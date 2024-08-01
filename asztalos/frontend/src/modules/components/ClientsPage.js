import React, { useState, useEffect } from "react";
import Loading from "../helpers/Loading";
import { Button, Table, Modal } from "react-bootstrap";
import { getAllClients } from "../../data/getters";
import "bootstrap-icons/font/bootstrap-icons.css";
import sorting from "../helpers/sort";
import { useDispatch } from "react-redux";
import clientApi from "../../data/api/clientApi";
import NewClientModal from "../modals/NewClientModal";
import ClientUpdateModal from "../modals/ClientUpdateModal";

function ClientsPage() {
  const dispatch = useDispatch();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [clientIdToDelete, setClientIdToDelete] = useState(null);
  const [clientIdToModify, setClientIdToModify] = useState(null);
  const [showClientUpdateModal, setShowClientUpdateModal] = useState(false);
  const [showNewClient, setShowNewClient] = useState(false);
  const [render, setRender] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 1,
  });

  function rendering() {
    setRender(!render);
  }

  useEffect(() => {
    async function loadClients() {
      setLoading(true); // Start loading
      const clientsData = await getAllClients();
      setClients(clientsData);
      setLoading(false); // End loading
    }

    loadClients();
  }, [render]);

  const handleNewClientClick = () => {
    setShowNewClient(true);
  };

  const handleNewClientClose = () => {
    setShowNewClient(false);
  };

  const handleModifyClient = (event, clientId) => {
    event.preventDefault();
    event.stopPropagation();
    setClientIdToModify(clientId);
    setShowClientUpdateModal(true);
  };

  const handleClientUpdateClose = () => {
    setShowClientUpdateModal(false);
    setClientIdToModify(null);
  };

  const handleClientUpdate = async (updatedClientData) => {
    await dispatch(
      clientApi.updateClientApi(clientIdToModify, updatedClientData)
    );
    setShowClientUpdateModal(false);
    rendering();
  };

  const handleDeleteClient = (event, clientId) => {
    event.preventDefault();
    event.stopPropagation();
    setShowDeleteConfirmation(true);
    setClientIdToDelete(clientId);
  };

  const handleConfirmDelete = async () => {
    await dispatch(clientApi.deleteClientApi(clientIdToDelete));
    setShowDeleteConfirmation(false);
    rendering();
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
  };

  const requestSort = (key) => {
    let direction = 1;
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 1) {
      direction = -1;
    }

    setSortConfig({ key, direction });
    const sorted = sorting(clients, { key, direction });
    setClients(sorted);
  };

  const handleReloadClients = async () => {
    setLoading(true); // Start loading
    const clientsData = await getAllClients();
    setClients(clientsData);
    setLoading(false); // End loading
  };

  return (
    <div className="h-100">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>Clients Page</h1>
        <div>
          <Button
            variant="light"
            className="me-2"
            onClick={handleReloadClients}
          >
            <i className="bi bi-arrow-clockwise"></i>
          </Button>
          <Button
            variant="secondary"
            className="me-2"
            onClick={handleNewClientClick}
          >
            New Client
          </Button>
        </div>
      </div>
      <div
        style={{
          maxHeight: "90vh", // Specify a max height for scrolling
          overflowY: "auto", // Enable vertical scrolling
          border: "thin solid lightgrey",
          borderRadius: "0.5rem",
        }}
      >
        {loading ? (
          <Loading />
        ) : (
          <Table striped bordered hover>
            <thead
              style={{
                position: "sticky",
                top: 0,
                backgroundColor: "#f8f9fa",
                zIndex: 1,
              }}
            >
              <tr>
                <th
                  onClick={() => requestSort("clientId")}
                  style={{ cursor: "pointer" }}
                >
                  ID
                </th>
                <th
                  onClick={() => requestSort("name")}
                  style={{ cursor: "pointer" }}
                >
                  Name
                </th>
                <th
                  onClick={() => requestSort("clientSold")}
                  style={{ cursor: "pointer" }}
                >
                  Sold
                </th>
                <th>Address</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.clientId}>
                  <td>{client.clientId}</td>
                  <td>{client.name}</td>
                  <td>{client.clientSold}</td>
                  <td className="d-flex justify-content-between ">
                    {client.address}
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Button
                        variant="link"
                        onClick={(event) =>
                          handleModifyClient(event, client.clientId)
                        }
                        style={{ padding: 0 }}
                      >
                        <i
                          className="bi bi-pencil"
                          style={{ fontSize: "0.8rem" }}
                        ></i>
                      </Button>
                      <Button
                        variant="link"
                        onClick={(event) =>
                          handleDeleteClient(event, client.clientId)
                        }
                        style={{ padding: 0 }}
                        className="ms-2"
                      >
                        <i
                          className="bi bi-trash"
                          style={{ fontSize: "0.8rem" }}
                        ></i>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
      <Modal show={showNewClient} onHide={handleNewClientClose}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Client</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <NewClientModal onClose={handleNewClientClose} />
        </Modal.Body>
      </Modal>
      <Modal show={showClientUpdateModal} onHide={handleClientUpdateClose}>
        <Modal.Header closeButton>
          <Modal.Title>Update Client</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ClientUpdateModal
            handleClose={handleClientUpdateClose}
            clientId={clientIdToModify}
            onUpdate={handleClientUpdate}
          />
        </Modal.Body>
      </Modal>

      <Modal show={showDeleteConfirmation} onHide={handleCancelDelete}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this client?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancelDelete}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default ClientsPage;
