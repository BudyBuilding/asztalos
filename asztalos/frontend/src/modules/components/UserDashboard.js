import { useState, useEffect, useRef } from "react";
import { IonIcon } from "@ionic/react";
import { pencil, trash } from "ionicons/icons";
import { useDispatch, useSelector } from "react-redux";
import ListGroup from "react-bootstrap/ListGroup";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import { Modal } from "react-bootstrap";
import DashboardListItem from "../helpers/DashboardWorkListItem";
import NewClientModal from "../modals/NewClientModal";
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
import Chart from "chart.js/auto";

import {
  fetchCreatedItemsForWork,
  fetchObjectsForWork,
  fetchTables,
} from "../../data/storeManager";
import ClientUpdateModal from "../modals/ClientUpdateModal";

function UserDashboard() {
  const dispatch = useDispatch();
  const workStatusChartRef = useRef(null);
  const paymentStatusChartRef = useRef(null);

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

  // State for collapsible sections
  const [showClients, setShowClients] = useState(true);
  const [showWorks, setShowWorks] = useState(true);
  const [showStatistics, setShowStatistics] = useState(true);

  // Toggle functions for collapsible sections
  const toggleClients = () => setShowClients(!showClients);
  const toggleWorks = () => setShowWorks(!showWorks);
  const toggleStatistics = () => setShowStatistics(!showStatistics);

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

  // Statistics calculation functions
  const calculateWorkStats = () => {
    const lastMonthWorks = works.filter(
      (work) =>
        new Date(work.orderDate) >=
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );

    const pending = works.filter((work) => work.status === "Pending").length;
    const completed = works.filter(
      (work) => work.status === "Completed"
    ).length;
    const measured = works.filter((work) => work.status === "Measured").length;
    const cancelled = works.filter(
      (work) => work.status === "Cancelled"
    ).length;
    const active = works.filter((work) => work.status === "Active").length;

    /*
    const pending = 8;
    const measured = 18;*/
    return { pending, measured, completed, cancelled, active };
  };

  const calculatePaymentStats = () => {
    const totalPaid = works.reduce((sum, work) => sum + work.paid, 0);
    const totalPrice = works.reduce((sum, work) => sum + work.price, 0);

    return { totalPaid, totalDue: totalPrice - totalPaid };
  };

  const workStats = calculateWorkStats();
  const paymentStats = calculatePaymentStats();

  useEffect(() => {
    setClients(loadClients());
    setWorks(loadWorks());
  }, [render]);

  useEffect(() => {
    if (workStatusChartRef.current) {
      const chartInstance = new Chart(workStatusChartRef.current, {
        type: "pie",
        data: {
          labels: ["Pending", "Measured", "Completed", "Cancelled", "Active"],
          datasets: [
            {
              data: [
                workStats.pending,
                workStats.measured,
                workStats.completed,
                workStats.cancelled,
                works.active,
              ],
              backgroundColor: [
                "#FF6384",
                "#36A2EB",
                "#FFCD56",
                "#FF8A65",
                "#4BC0C0",
              ],
            },
          ],
        },
      });

      // Clean up chart when component unmounts
      return () => {
        chartInstance.destroy();
      };
    }
  }, [workStats]);

  useEffect(() => {
    if (paymentStatusChartRef.current) {
      const chartInstance = new Chart(paymentStatusChartRef.current, {
        type: "pie",
        data: {
          labels: ["Paid", "Due"],
          datasets: [
            {
              data: [paymentStats.totalPaid, paymentStats.totalDue],
              backgroundColor: ["#4CAF50", "#FF9800"],
            },
          ],
        },
      });
      // Clean up chart when component unmounts
      return () => {
        chartInstance.destroy();
      };
    }
  }, [paymentStats]);

  return (
    <div>
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

      <div className="container d-xl-block">
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
          </div>
        </div>
      </div>
      {/* Statistics Section */}
      <Container className="d-xl-block">
        <div
          className="d-flex justify-content-between align-items-center"
          onClick={toggleStatistics}
          style={{
            cursor: "pointer",
          }}
        >
          <p className="fs-2 fw-bold text-start mb-0">Statistics</p>
          <Button
            variant="link"
            style={{ fontSize: "24px", textDecoration: "none" }}
          >
            {showStatistics ? "−" : "+"}
          </Button>
        </div>
        {showStatistics && (
          <div className="d-flex flex-column flex-lg-row justify-content-between">
            <div className="chart-container mb-4">
              <h5>Work Status in the Last Month</h5>
              <canvas ref={workStatusChartRef}></canvas>
            </div>
            <div className="chart-container mb-4">
              <h5>Payment Status</h5>
              <canvas ref={paymentStatusChartRef}></canvas>
            </div>
          </div>
        )}
      </Container>

      <Container className="d-xl-block">
        <div
          className="d-flex justify-content-between align-items-center"
          onClick={toggleClients}
          style={{
            cursor: "pointer",
          }}
        >
          <p className="fs-2 fw-bold text-start mb-0">Clients</p>
          <Button
            variant="link"
            style={{ fontSize: "24px", textDecoration: "none" }}
          >
            {showClients ? "−" : "+"}
          </Button>
        </div>

        {showClients && (
          <>
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
          </>
        )}
      </Container>

      <div className="container d-xl-block">
        <div
          className="d-flex justify-content-between align-items-center"
          onClick={toggleWorks}
          style={{
            cursor: "pointer",
          }}
        >
          <p className="fs-2 fw-bold text-start mb-0">Recent works</p>
          <Button
            variant="link"
            style={{ fontSize: "24px", textDecoration: "none" }}
          >
            {showWorks ? "−" : "+"}
          </Button>
        </div>
        {showWorks && (
          <>
            <ListGroup.Item className="p-0 m-0">
              <div className="d-flex w-100 m-0 p-3 pb-2 justify-content-between">
                <div className="w-100 text-start" style={{ width: "25%" }}>
                  <Button
                    variant="primary"
                    onClick={() => requestSort("client")}
                  >
                    Client
                  </Button>
                </div>
                <div className="w-100 text-center" style={{ width: "25%" }}>
                  <Button variant="primary" onClick={() => requestSort("Date")}>
                    Date
                  </Button>
                </div>
                <div className="w-100 text-center" style={{ width: "25%" }}>
                  <Button
                    variant="primary"
                    onClick={() => requestSort("status")}
                  >
                    Status
                  </Button>
                </div>
                <div className="w-100 text-center" style={{ width: "25%" }}>
                  <Button
                    variant="primary"
                    onClick={() => requestSort("price")}
                  >
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
          </>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;
