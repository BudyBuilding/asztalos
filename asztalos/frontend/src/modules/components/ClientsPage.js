import React, { useState, useEffect, useRef } from "react";
import Loading from "../helpers/Loading";
import { Button, Table, Modal, Form } from "react-bootstrap";
import { getAllClients } from "../../data/getters";
import "bootstrap-icons/font/bootstrap-icons.css";
import sorting from "../helpers/sort";
import { useDispatch } from "react-redux";
import clientApi from "../../data/api/clientApi";
import NewClientModal from "../modals/NewClientModal";
import ClientUpdateModal from "../modals/ClientUpdateModal";
import { useNavigate } from "react-router-dom";
import { loadClients, selectClient } from "../../data/store/actions/clientStoreFunctions"; // Ellenőrizd az elérési utat
// Helper function for filtering (assumed to be similar to sorting)
const filtering = (data, filterConfig) => {
  if (!filterConfig || !filterConfig.value) return data;
  return data.filter((item) =>
    String(item[filterConfig.key])
      .toLowerCase()
      .includes(filterConfig.value.toLowerCase())
  );
};


function ClientsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [filteredClients, setFilteredClients] = useState([]); // For displaying filtered data
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [clientIdToDelete, setClientIdToDelete] = useState(null);
  const [clientIdToModify, setClientIdToModify] = useState(null);
  const [showClientUpdateModal, setShowClientUpdateModal] = useState(false);
  const [showNewClient, setShowNewClient] = useState(false);
  const [render, setRender] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 1 });
  const [filterConfig, setFilterConfig] = useState({ key: "name", value: "" });
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]); // Tegyük fel, hogy itt tárolod az ügyfeleket
  
  function rendering() {
    setRender(!render);
  }
  
  const tableContainerRef = useRef(null);
      useEffect(() => {
          const orig = document.body.style.overflow;
          document.body.style.overflow = "hidden";
  
          const handleWheel = e => {
           if (tableContainerRef.current && !tableContainerRef.current.contains(e.target)) {
             e.preventDefault();
           }
          };
  
          window.addEventListener("wheel", handleWheel, { passive: false });
  
          return () => {
            document.body.style.overflow = orig;
            window.removeEventListener("wheel", handleWheel);
          };
        }, []);
  


  const handleRowClick = async (clientId) => {
    setLoading(true);
    try {
      dispatch(selectClient(clientId));
      navigate(`/clientAnalyzer/${clientId}`);
      setLoading(false);
    } catch (error) {
      console.error("Error selecting client:", error);
      setLoading(false);
    }
  };


  // Load clients on mount or re-render
  useEffect(() => {
    async function loadClients() {
      setLoading(true);
      const clientsData = await getAllClients();
      setClients(clientsData);
      setFilteredClients(clientsData); // Initialize filtered data
      setLoading(false);
    }
    loadClients();
  }, [render]);

  // Apply filtering whenever filterConfig changes
  useEffect(() => {
    const filtered = filtering(clients, filterConfig);
    setFilteredClients(filtered);
  }, [clients, filterConfig]);

  // Apply sorting whenever sortConfig changes
  useEffect(() => {
    if (sortConfig.key) {
      const sorted = sorting(filteredClients, sortConfig);
      setFilteredClients([...sorted]);
    }
  }, [sortConfig]);

  const handleNewClientClick = () => setShowNewClient(true);
  const handleNewClientClose = () => {
    setClients(loadClients());
    setShowNewClient(false);
    rendering();  
  }
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
    await dispatch(clientApi.updateClientApi(clientIdToModify, updatedClientData));
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

  const handleCancelDelete = () => setShowDeleteConfirmation(false);

  const requestSort = (key) => {
    let direction = 1;
    if (sortConfig.key === key && sortConfig.direction === 1) {
      direction = -1;
    }
    setSortConfig({ key, direction });
  };

  const handleFilterChange = (e) => {
    setFilterConfig({ ...filterConfig, value: e.target.value });
  };

  const handleFilterKeyChange = (e) => {
    setFilterConfig({ ...filterConfig, key: e.target.value });
  };

  const handleSortChange = (e) => {
    const [key, direction] = e.target.value.split(":");
    setSortConfig({ key, direction: parseInt(direction) });
  };

  const handleReloadClients = async () => {
    setLoading(true);
    const clientsData = await getAllClients();
    setClients(clientsData);
    setFilteredClients(clientsData);
    setLoading(false);
  };

  return (
      <div className="container d-xl-block h-50">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>Clients Page</h1>
        <div>
          {/*<Button variant="light" className="me-2" onClick={handleReloadClients}>
            <i className="bi bi-arrow-clockwise"></i>
          </Button>*/}
          <Button variant="secondary" className="me-2" onClick={handleNewClientClick}>
            New Client
          </Button>
        </div>
      </div>

      {/* Filtering and Sorting Controls */}
      <div className="mb-3 d-flex gap-3">
        <Form.Group>
          <Form.Label>Filter by</Form.Label>
          <Form.Select onChange={handleFilterKeyChange} value={filterConfig.key}>
            <option value="name">Name</option>
            <option value="clientSold">Sold</option>
            <option value="address">Address</option>
          </Form.Select>
          </Form.Group>
          <Form.Group>
          <Form.Label>Filter value</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter filter value"
            value={filterConfig.value}
            onChange={handleFilterChange}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Sort by</Form.Label>
          <Form.Select onChange={handleSortChange}>
            <option value="">Select sorting</option>
            <option value="name:1">Name (A-Z)</option>
            <option value="name:-1">Name (Z-A)</option>
            <option value="clientSold:1">Sold (Low to High)</option>
            <option value="clientSold:-1">Sold (High to Low)</option>
          </Form.Select>
        </Form.Group>
      </div>

      <div
        style={{
          maxHeight: "90vh",
          overflowY: "auto",
          border: "thin solid lightgrey",
          borderRadius: "0.5rem",
        }}
        ref={tableContainerRef}
      >
        {loading ? (
          <Loading />
        ) : clients.length === 0 ? (
                <div
                  style={{
                    padding: "1rem",
                    textAlign: "center",
                    color: "#666",
                    fontStyle: "italic",
                  }}
                >
                  Nincs még kliens, kérlek hozz létre egyet.
                </div>
              ) 
        :
        (<div style={{ maxHeight: "70vh", }} >
          <Table striped bordered hover responsive>
            <thead
              style={{
                position: "sticky",
                top: 0,
                backgroundColor: "#f8f9fa",
                zIndex: 1,
              }}
            >
              <tr>
                <th onClick={() => requestSort("clientId")} style={{ cursor: "pointer" }}>
                  ID
                </th>
                <th onClick={() => requestSort("name")} style={{ cursor: "pointer" }}>
                  Name
                </th>
                <th onClick={() => requestSort("clientSold")} style={{ cursor: "pointer" }}>
                  Sold
                </th>
                <th>Address</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client) => (
                <tr 
                key={client.clientId}
              onClick={() => handleRowClick(client.clientId)}
              style={{ cursor: "pointer", borderBottom: "1px solid #ddd" }}
                >
                  <td>{client.clientId}</td>
                  <td>{client.name}</td>
                  <td>{client.clientSold}</td>
                  <td className="d-flex justify-content-between">
                    {client.address}
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Button
                        variant="link"
                        onClick={(event) => handleModifyClient(event, client.clientId)}
                        style={{ padding: 0 }}
                      >
                        <i className="bi bi-pencil" style={{ fontSize: "0.8rem" }}></i>
                      </Button>
                      <Button
                        variant="link"
                        onClick={(event) => handleDeleteClient(event, client.clientId)}
                        style={{ padding: 0 }}
                        className="ms-2"
                      >
                        <i className="bi bi-trash" style={{ fontSize: "0.8rem" }}></i>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          </div>
        )}
      </div>

      {/* Modals */}
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