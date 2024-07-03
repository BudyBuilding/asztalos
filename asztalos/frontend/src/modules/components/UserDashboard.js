import { useState, useEffect } from "react";
import { IonIcon } from "@ionic/react";
import { pencil, trash } from "ionicons/icons";
import { useDispatch, useSelector } from "react-redux";
import ListGroup from "react-bootstrap/ListGroup";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import { Modal } from "react-bootstrap";
import DashboardListItem from "../helpers/dashboardListItem";
import ClientAnalyzer from "./clientAnalyzer";
import NewClient from "../modals/newClient";
import sorting from "../helpers/sort";
import { useNavigate } from "react-router-dom";
import { selectClient } from "../../data/store/actions/clientStoreFunctions";
import { selectWork } from "../../data/store/actions/workStoreFunctions";
import authApi from "../../data/api/authApi";
import clientApi from "../../data/api/clientApi";
import workApi from "../../data/api/workApi";
import { deleteWork } from "../../data/api/apiService";
import store from "../../data/store/store";
import Loading from "../helpers/Loading";
import { getAllClients, getAllWorks, getWorkById } from "../../data/getters";

import {
  fetchCreatedItemsForWork,
  fetchObjectsForWork,
  fetchTables,
} from "../../data/storeManager";
import ClientUpdateModal from "../modals/ClientUpdateModal";

function UserDashboard() {
  const dispatch = useDispatch();

  const [works, setWorks] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [clientIdToDelete, setClientIdToDelete] = useState(null);
  const [clientIdToModify, setClientIdToModify] = useState(null);
  const [showClientUpdateModal, setShowClientUpdateModal] = useState(false);
  const [showNewClient, setShowNewClient] = useState(false);
  const [render, setRender] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setClients(loadClients());
    setWorks(loadWorks());
  }, [render]);

  function loadClients() {
    setLoading(false);
    return getAllClients();
  }

  function loadWorks() {
    setLoading(false);
    return getAllWorks();
  }

  function rendering() {
    setRender(!render);
  }

  store.subscribe(() => {
    // console.log("State changed:", store.getState());
    setRender(!render);
  });

  const handleSelectClient = async (clientId) => {
    setLoading(true);
    try {
      dispatch(selectClient(clientId));
      navigate(`/clientAnalyzer/${clientId}`);
      setLoading(false);
    } catch (error) {
      console.error("Error while selecting client:", error);
      setLoading(false);
    }
  };

  const handleSelectWork = async (workId) => {
    setLoading(true);
    try {
      dispatch(selectWork(workId));
      fetchTables(workId);
      fetchObjectsForWork(workId);
      fetchCreatedItemsForWork(workId);
      const clientId = dispatch(getWorkById(workId)).client.clientId;
      dispatch(selectClient(clientId));
      navigate(`/workAnalyzer/${workId}`);
      setLoading(false);
    } catch (error) {
      console.error("Error while selecting work:", error);
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
    authApi.logoutApi();
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
  const handleDeleteWork = async (workId) => {
    await dispatch(workApi.deleteWorkApi(workId));
    rendering();
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
            {clients &&
              clients.map((client) => (
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
            <DashboardListItem
              key={work.workId}
              work={work}
              onDelete={handleDeleteWork}
              onClick={handleSelectWork}
            />
          ))}
        </ListGroup>
      </div>
    </>
  );
}

export default UserDashboard;
