import { useState, useEffect } from "react";
import { IonIcon } from "@ionic/react";
import { pencil, trash } from "ionicons/icons";
import { useDispatch, useSelector } from "react-redux";
import ListGroup from "react-bootstrap/ListGroup";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import { Modal } from "react-bootstrap";
import DashboardListItem from "../reusable/dashboardListItem";
import { selectClient } from "../data/store/actions/actions";
import ClientAnalyzer from "../reusable/clientAnalyzer";
import NewClient from "../reusable/newClient";
import sorting from "../reusable/sort";
import { useNavigate } from "react-router-dom";
import {
  getClients,
  getAllWorks,
  logout,
  getClientFromStore,
  deleteClient,
  updateClient,
} from "../data/firebase/apiService";
import store from "../data/store/store";
import Loading from "../reusable/Loading";
import ClientUpdateModal from "../reusable/ClientUpdateModal";

function Dashboard({ onSelectClient }) {
  const dispatch = useDispatch();

  const [works, setWorks] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [clientIdToDelete, setClientIdToDelete] = useState(null);
  const [clientIdToModify, setClientIdToModify] = useState(null);
  const [showClientUpdateModal, setShowClientUpdateModal] = useState(false);
  const [showNewClient, setShowNewClient] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      const worksData = await dispatch(getAllWorks());
      const clientsData = await dispatch(getClients());
      setWorks(worksData);
      setClients(clientsData);
      setLoading(false);
    }
    fetchData();
  }, [dispatch, showDeleteConfirmation, showClientUpdateModal, showNewClient]);

  store.subscribe(() => {
    //console.log("State changed:", store.getState());
  });

  const handleSelectClient = async (clientId) => {
    setLoading(true);
    try {
      const clientData = await dispatch(getClientFromStore(clientId));
      dispatch(selectClient(clientId));
      console.log({ clientId });
      navigate(`/clientAnalyzer/${clientId}`);
      setLoading(false);
    } catch (error) {
      console.error("Error while selecting client:", error);
      setLoading(false);
    }
  };

  const handleNewClientClick = () => {
    setShowNewClient(true);
  };

  const handleNewClientClose = () => {
    setShowNewClient(false);
  };

  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 1,
  });

  const requestSort = (key) => {
    let direction = 1;
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 1) {
      direction = 2;
    }
    if (key === "Status") {
      direction = sortConfig.direction === 4 ? 1 : sortConfig.direction + 1;
    }
    setSortConfig({ key, direction });
    const sorted = sorting(works, { key, direction });
    setWorks(sorted);
  };

  const handleLogout = () => {
    logout();
  };

  const handleModifyClient = (event, clientId) => {
    console.log(clientId);
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
    console.log("Updating client:", clientIdToModify, updatedClientData);
    await dispatch(updateClient(clientIdToModify, updatedClientData));
    const updatedClients = clients.map((client) =>
      client.clientId === clientIdToModify
        ? { ...client, ...updatedClientData }
        : client
    );
    setClients(updatedClients);
    setShowClientUpdateModal(false);
  };

  const handleDeleteClient = (event, clientId) => {
    event.preventDefault();
    event.stopPropagation();
    setShowDeleteConfirmation(true);
    setClientIdToDelete(clientId);
  };

  const handleConfirmDelete = async () => {
    await dispatch(deleteClient(clientIdToDelete));
    setShowDeleteConfirmation(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
  };

  return (
    <>
      <Modal show={showNewClient} onHide={handleNewClientClose}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Client</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <NewClient onClose={handleNewClientClose} />
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
          <Modal.Title>Delete Client</Modal.Title>
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

      <Container className="container d-xl-block">
        <div className="d-flex justify-content-between align-items-center">
          <p className="fs-1 fw-bold text-start mb-0">Dashboard</p>
          <div>
            <Button
              variant="primary"
              onClick={handleNewClientClick}
              className="me-3"
            >
              New client
            </Button>
            <Button variant="danger" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </Container>

      <Container className="d-xl-block">
        <p className="fs-2 fw-bold text-start">Clients</p>
        {loading ? (
          <Loading />
        ) : (
          <div className="d-flex flex-nowrap overflow-x-scroll">
            {clients.map((client) => (
              <div
                key={client.clientId}
                className="p-3 border rounded"
                style={{ minWidth: "200px", margin: "10px" }}
                onClick={() => handleSelectClient(client.clientId)}
              >
                <p className="fw-bold">{client.name}</p>
                <p>Tel: {client.telephone}</p>
                <p>Address: {client.address}</p>
                <div className="d-flex">
                  <p className="fs-xs">Id: {client.clientId}</p>
                  <Button
                    variant="primary"
                    onClick={(event) =>
                      handleModifyClient(event, client.clientId)
                    }
                    style={{
                      background: "transparent",
                      border: "1px solid #007bff",
                      borderRadius: "40%",
                      marginLeft: "0.5rem",
                    }}
                  >
                    <IonIcon
                      icon={pencil}
                      style={{ fontSize: "20px", color: "#007bff" }}
                    />
                  </Button>
                  <Button
                    variant="danger"
                    onClick={(event) =>
                      handleDeleteClient(event, client.clientId)
                    }
                    style={{
                      background: "transparent",
                      border: "1px solid #dc3545",
                      borderRadius: "40%",
                      marginLeft: "0.5rem",
                    }}
                  >
                    <IonIcon
                      icon={trash}
                      style={{ fontSize: "20px", color: "#dc3545" }}
                    />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>

      <div className="container d-xl-block">
        <p className="fs-2 fw-bold text-start">Recent works</p>
        <ListGroup.Item className="p-0 m-0">
          <div className="d-flex w-100 m-0 p-3 pb-2 justify-content-between">
            <div className="w-100 text-start" style={{ width: "25%" }}>
              <Button variant="primary" onClick={() => requestSort("client")}>
                Client
              </Button>
            </div>
            <div className="w-100 text-center" style={{ width: "25%" }}>
              <Button variant="primary" onClick={() => requestSort("Date")}>
                Date
              </Button>
            </div>
            <div className="w-100 text-center" style={{ width: "25%" }}>
              <Button variant="primary" onClick={() => requestSort("status")}>
                Status
              </Button>
            </div>
            <div className="w-100 text-center" style={{ width: "25%" }}>
              <Button variant="primary" onClick={() => requestSort("price")}>
                Price
              </Button>
            </div>
            <div className="w-100 text-end" style={{ width: "25%" }}>
              <Button variant="primary" onClick={() => requestSort("paid")}>
                Paid
              </Button>
            </div>
          </div>
        </ListGroup.Item>

        <ListGroup>
          {works.map((work) => (
            <DashboardListItem key={work.workId} work={work} />
          ))}
        </ListGroup>
      </div>
    </>
  );
}

export default Dashboard;
