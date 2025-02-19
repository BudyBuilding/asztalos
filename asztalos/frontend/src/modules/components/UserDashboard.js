import { useState, useEffect, useRef } from "react";
import { IonIcon } from "@ionic/react";
import { filter, options, pencil, trash } from "ionicons/icons";
import { useDispatch, useSelector } from "react-redux";
import ListGroup from "react-bootstrap/ListGroup";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Button";
import OverlayTrigger from "react-bootstrap/Button";
import Tooltip from "react-bootstrap/Button";
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
  const formatDate = (dateString) => {
    if (dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString("hu-HU");  // Magyar nyelvi beállítás, vagy testre szabható
    }
    return "";
  };

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
   // setWorks(sorted);
  };

  const handleModifyClient = (event, clientId) => {
  //  console.log(clientId);
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
  //  console.log("Updating client:", clientIdToModify, updatedClientData);
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
/*  const handleDeleteWork = async (workId) => {
    await dispatch(workApi.deleteWorkApi(workId));
    rendering();
  };*/

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
   // setWorks(loadWorks());
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
  }, [workStats, works]);

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
    <div className="pb-5">
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
          <p className="fs-1 fw-bold text-start mb-0 ">Dashboard</p>
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
      <Container className="d-xl-block pb-4">
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

      <Container className="d-xl-block pb-4">
        <div
          className="d-flex justify-content-between align-items-center"
          onClick={toggleClients}
          style={{
            cursor: "pointer",
          }}
        >
          <p className="fs-2 fw-bold text-start mb-0">Clients</p>
          <div>
          <Button
            variant="link"
            style={{ fontSize: "20px", textDecoration: "none" }}
            onClick={(e) => {
              e.stopPropagation(); // Megakadályozza a toggleWorks futását
              // Itt lehet hozzáadni a rendezés logikáját
              //handleSort();
            }}
          >
            <IonIcon icon={options} />
          </Button>
          <Button
            variant="link"
            style={{ fontSize: "20px", textDecoration: "none" }}
            onClick={(e) => {
              e.stopPropagation(); // Megakadályozza a toggleWorks futását
              // Itt lehet hozzáadni a rendezés logikáját
              //handleSort();
            }}
          >
              <IonIcon icon={filter} />
          </Button>
          <Button
            variant="link"
            style={{ fontSize: "24px", textDecoration: "none" }}
          >
            {showClients ? "−" : "+"}
          </Button>
          </div>
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
      style={{
        minWidth: "20vh",
        margin: "10px",
        backgroundColor: "white",
        borderRadius: "15px",
        marginBottom: "15px",
        height: "20vh",
        padding: "10px",
        paddingBottom: "0px",
        position: "relative", // A gombok számára referencia pozíció
      }}
      onClick={() => handleSelectClient(client.clientId)}
    >
      <p className="fw-bold">{client.name}</p>
      <p>Tel: {client.telephone}</p>
      <p>Address: {client.address}</p>
      <div className="d-flex">
        <p className="fs-xs" style={{fontSize: "13px", color: "#6c757d"}}>Id: {client.clientId}</p>
      </div>

      {/* A gombok elhelyezése a jobb alsó sarokban */}
      <div
        style={{
          position: "absolute",
          bottom: "10px", // Az alján 10px távolságra
          right: "10px",  // A jobb szélén 10px távolságra
          display: "flex",
          alignItems: "center",
        }}
      >
        <Button
          variant="primary"
          onClick={(event) => handleModifyClient(event, client.clientId)}
          style={{
            background: "transparent",
            border: "none",
            width: "30px",
          }}
        >
          <IonIcon
            icon={pencil}
            style={{ fontSize: "20px", color: "#6c757d" }}
          />
        </Button>
        <Button
          variant="danger"
          onClick={(event) => handleDeleteClient(event, client.clientId)}
          style={{
            background: "transparent",
            border: "none",
          }}
        >
          <IonIcon
            icon={trash}
            style={{ fontSize: "20px", color: "#6c757d" }}
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
          <p className="fs-2 fw-bold text-start mb-3">Recent works</p>
          <div>
     
          <Button
            variant="link"
            style={{ fontSize: "20px", textDecoration: "none" }}
                onClick={(e) => {
                e.stopPropagation(); // Megakadályozza a toggleWorks futását
                // Itt lehet hozzáadni a rendezés logikáját
                //handleSort();
              }}
          >
            <IonIcon icon={options} />
          </Button>

          <Button
            variant="link"
            style={{ fontSize: "20px", textDecoration: "none"}}
              onClick={(e) => {
              e.stopPropagation(); // Megakadályozza a toggleWorks futását
              // Itt lehet hozzáadni a rendezés logikáját
              //handleSort();
            }}
          >
          <IonIcon icon={filter} />
          </Button>
          <Button
            variant="link"
            style={{ fontSize: "24px", textDecoration: "none" }}
          >
            {showWorks ? "−" : "+"}
          </Button>
          </div>

        </div>
        {showWorks && (
        <>
          <div style={{ 
            border: "thin solid #dee2e6",
            borderRadius: "0.25rem",
          }}>
            <Table striped hover responsive className="w-100" 
              style={{ 
                tableLayout: "fixed", 
                backgroundColor: "white", 
                color: "black",
                border: "none",
                padding: "0",
              }}
            >
              {/* Fixált fejléc */}
              <thead style={{ 
                position: "sticky", 
                top: "0", 
                backgroundColor: "#E9E7F1", 
                zIndex: "10",
                padding: "10px", /* Fejléc padding */
                borderBottom: "5px solid black"
              }}>
                <tr style={{ height: "60px", boxSizing: "border-box", width: "100%" }}>
                  <th style={{  width: "11%", textAlign: "left", padding: "10px" }}>Client</th>
                  <th style={{  width: "11%", textAlign: "left", padding: "10px" }}>Name</th>
                  <th style={{  width: "11%", textAlign: "left", padding: "10px" }}>Paid</th>
                  <th style={{  width: "11%", textAlign: "left", padding: "10px" }}>Price</th>
                  <th style={{  width: "11%", textAlign: "left", padding: "10px" }}>Label</th>
                  <th style={{  width: "11%", textAlign: "left", padding: "10px" }}>Status</th>
                  <th style={{  width: "11%", textAlign: "left", padding: "10px" }}>Measured</th>
                  <th style={{  width: "11%", textAlign: "left", padding: "10px" }}>Ordered</th>
                  <th style={{  width: "11%", textAlign: "left", padding: "10px" }}>Completed</th>
                  <th style={{  width: "11%", textAlign: "left", padding: "10px" }}>Actions</th>
                </tr>
              </thead>

              {/* Görgethető test */}
              <tbody style={{ display: "block", maxHeight: "540px", overflowY: "overlay", padding: "10px", paddingRight: "20px" }}>
                {works.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center">There are no works, create one</td>
                  </tr>
                ) : (
                  works.map((work) => (
                    <tr key={work.workId} style={{ height: "50px", display: "table", width: "100%", borderBottom: "thin solid #E9E7F1" }}>
                      <td className="text-start" style={{ width: "11%", verticalAlign: "middle", }}>{work.client.name}</td>
                      <td className="text-start" style={{ width: "11%", verticalAlign: "middle", }}>{work.name}</td>
                      <td className="text-start" style={{ width: "11%", verticalAlign: "middle", }}>{work.paid}</td>
                      <td className="text-start" style={{ width: "11%", verticalAlign: "middle", }}>{work.price}</td>
                      <td className="text-start" style={{ width: "11%", verticalAlign: "middle", }}>{work.label}</td>
                      <td className="text-start" style={{ width: "11%", verticalAlign: "middle", }}>{work.status}</td>
                      <td className="text-start" style={{ width: "11%", verticalAlign: "middle", }}>{formatDate(work.measureDate)}</td>
                      <td className="text-start" style={{ width: "11%", verticalAlign: "middle", }}>{formatDate(work.ordereDate)}</td>
                      <td className="text-start" style={{ width: "11%", verticalAlign: "middle", }}>{formatDate(work.finishDate)}</td>
                      <td className="text-start" style={{ width: "12%", verticalAlign: "middle", }}>
                        <button style={{ color: "red",  border: "none", background: "none", cursor: "pointer" }}>
                          🗑
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;
