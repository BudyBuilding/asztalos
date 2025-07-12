import { useState, useEffect, useRef } from "react";
import { IonIcon } from "@ionic/react";
import {
  filter,
  options,
  pencil,
  trash,
  radioButtonOn,
  radioButtonOffOutline
} from "ionicons/icons";
import { useDispatch, useSelector } from "react-redux";
import ListGroup from "react-bootstrap/ListGroup";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Table";
import OverlayTrigger from "react-bootstrap/Button";
import Tooltip from "react-bootstrap/Button";
import { Modal } from "react-bootstrap";
import DashboardListItem from "../helpers/DashboardWorkListItem";
import NewClientModal from "../modals/NewClientModal";
import sorting from "../helpers/sort";
import filtering from "../helpers/filter";
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
  fetchCreatedTablesForWork,
  fetchObjectsForWork,
  fetchTables
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
  const [showSortWork, setShowSortWork] = useState(false);
  const [showSortClients, setShowSortClients] = useState(false);
  const [showFilterWork, setShowFilterWork] = useState(false);
  const [showFilterClients, setShowFilterClients] = useState(false);
  const [workList, setWorkList] = useState([]);
  const [clientList, setClientList] = useState([]);
  const navigate = useNavigate();
  const [workFilterOptions, setWorkFilterOptions] = useState([
    { label: "Client", vkey: "client.name", type: "string", value: "" },
    { label: "Name", vkey: "name", type: "string", value: "" },
    {
      label: "Paid",
      vkey: "Paid",
      type: "interval",
      min: getMin(works, "paid"),
      max: getMax(works, "paid")
    },
    {
      label: "Status",
      vkey: "status",
      type: "valueList",
      values: getValues(works, "status"),
      value: getValues(works, "status")
    },
    {
      label: "Measured",
      vkey: "measureDate",
      type: "interval",
      min: getMin(works, "measureDate"),
      max: getMax(works, "measureDate")
    },
    {
      label: "Ordered",
      vkey: "orderDate",
      type: "interval",
      min: getMin(works, "orderDate"),
      max: getMax(works, "orderDate")
    },
    {
      label: "Completed",
      vkey: "finishDate",
      type: "interval",
      min: getMin(works, "finishDate"),
      max: getMax(works, "finishDate")
    }
  ]);
  const [visibleStatus, setVisibleStatus] = useState(false);

  // Kattintás eseménykezelő, ami a blokk láthatóságát váltja
  const handleToggleVisibility = () => {
    if (showFilterWork) {
      setVisibleStatus(!visibleStatus);
    }
  };
  /*
      const handleRowClick = async (workId) => {
        setLoading(true);
        try {
          dispatch(selectWork(workId));
          await fetchTables(workId);
          await fetchObjectsForWork(workId);
          await fetchCreatedItemsForWork(workId);
          await fetchCreatedTablesForWork(workId);
          const clientId = dispatch(getWorkById(workId)).client.clientId;
          dispatch(selectClient(clientId));
          navigate(`/workAnalyzer/${workId}`);
          setLoading(false);
        } catch (error) {
          console.error("Error while selecting work:", error);
          setLoading(false);
        }
      };*/
  const handleRowClick = async (workId) => {
    setLoading(true);
    try {
      // 1) Betöltjük a thunk-okat, dispatch-elünk rájuk
      await fetchTables(workId);
      await fetchObjectsForWork(workId);
      await fetchCreatedItemsForWork(workId);
      await fetchCreatedTablesForWork(workId);

      const clientId = dispatch(getWorkById(workId)).client.clientId;
      dispatch(selectClient(clientId));
      dispatch(selectWork(workId));

      // 4) Navigálunk
      navigate(`/workAnalyzer/${workId}`);
    } catch (error) {
      console.error("Error while selecting work:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const clients = loadClients();
    if (clients.length === 0) {
      setShowClients(false);
    }
    const works = loadWorks();
    if (works.length === 0) {
      setShowWorks(false);
    }
    setClients(clients);
    setClientList(clients);
    setWorks(loadWorks());
    setWorkList(loadWorks());
    setWorkFilterOptions([
      { label: "Client", vkey: "client.name", type: "string", value: "" },
      { label: "Name", vkey: "name", type: "string", value: "" },
      {
        label: "Paid",
        vkey: "paid",
        type: "interval",
        min: getMin(works, "paid"),
        max: getMax(works, "paid")
      },
      {
        label: "Status",
        vkey: "status",
        type: "valueList",
        values: getValues(works, "status"),
        value: getValues(works, "status")
      },
      {
        label: "Measured",
        vkey: "measureDate",
        type: "interval",
        min: getMin(works, "measureDate"),
        max: getMax(works, "measureDate")
      },
      {
        label: "Ordered",
        vkey: "orderDate",
        type: "interval",
        min: getMin(works, "orderDate"),
        max: getMax(works, "orderDate")
      },
      {
        label: "Completed",
        vkey: "finishDate",
        type: "interval",
        min: getMin(works, "finishDate"),
        max: getMax(works, "finishDate")
      }
    ]);
  }, [render]);

  // State for collapsible sections
  const [showClients, setShowClients] = useState(true);
  const [showWorks, setShowWorks] = useState(true);
  const [showStatistics, setShowStatistics] = useState(true);

  // Toggle functions for collapsible sections
  const toggleClients = () => {
    if (!showSortClients) {
      setShowClients(!showClients);
    }
  };
  const toggleWorks = () => {
    if (!showSortWork && !showFilterWork) {
      setShowWorks(!showWorks);
    }
  };
  const toggleStatistics = () => setShowStatistics(!showStatistics);

  function loadClients() {
    setLoading(false);
    return getAllClients();
  }
  const formatDate = (dateString) => {
    if (dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString("hu-HU"); // Magyar nyelvi beállítás, vagy testre szabható
    }
    return "";
  };

  const workSortOptions = [
    { label: "Client", value: "client.clientId" },
    { label: "Name", value: "name" },
    { label: "Paid", value: "paid" },
    { label: "Status", value: "status" },
    { label: "Measured", value: "measured" },
    { label: "Ordered", value: "ordered" },
    { label: "Completed", value: "completed" }
  ];

  const clientSortOptions = [
    { label: "Name", value: "name" },
    { label: "Last Update", value: "clientId" }
  ];

  let clientFilterOptions = [
    { label: "Name", value: "name", type: "string" },
    { label: "Last Update", value: "clientId", type: "interval" }
  ];

  function loadMinMax(itemType, vkey, minMax) {
    if (itemType === "works") {
      const option = workFilterOptions.find((option) => option.vkey === vkey); // Keresés find-al
      if (option) {
        if (minMax === "min") {
          return option.min;
        } else {
          return option.max;
        }
      }
    }
    return null; // Ha nem találunk megfelelő választ, adjunk vissza null-t
  }

  function startFilter(itemType, key, type, actionType, value) {
    if (itemType === "works") {
      let updatedWorkConfig = workFilterOptions.map((config) => {
        if (config.vkey === key) {
          let newConfig = { ...config }; // Új objektum másolat

          if (type === "string") {
            newConfig.value = value;
          }

          if (type === "interval") {
            if (actionType === "min") {
              newConfig.min = value;
            } else {
              newConfig.max = value;
            }
          }

          if (type === "valueList") {
            console.log("ValueList", config.value);
            if (newConfig.value.includes(value)) {
              // Ha már benne van, kivesszük
              newConfig.value = newConfig.value.filter((val) => val !== value);
            } else {
              // Ha nincs benne, hozzáadjuk
              newConfig.value = [...newConfig.value, value];
            }
          }

          return newConfig;
        }
        return config;
      });

      // 🔹 Frissítjük az állapotot és azonnal használjuk az új értéket!
      setWorkFilterOptions(updatedWorkConfig);
      setWorkList(filtering(works, updatedWorkConfig)); // <<< Ezt kell átadni, nem a régit!
    }
  }

  function getValues(items, key) {
    const arr = Array.isArray(items) ? items : [];
    const values = [];
    arr.forEach((item) => {
      if (
        item != null &&
        item.hasOwnProperty(key) &&
        !values.includes(item[key])
      ) {
        values.push(item[key]);
      }
    });
    return values;
  }

  function getMin(items, key) {
    if (Array.isArray(items) && items.length > 0 && key != null) {
      let min = -1;

      items.forEach((item) => {
        const value = item[key];
        if (min === -1 && value != null) {
          min = value;
        }
        if (value != null && value < min) {
          min = value;
        }
      });
      return min;
    } else {
      return 0;
    }
  }

  function getMax(items, key) {
    if (Array.isArray(items) && items.length > 0 && key != null) {
      let max = -1;

      items.forEach((item) => {
        const value = item[key];
        if (max === -1 && value != null) {
          max = value;
        }
        if (value != null && value > max) {
          max = value;
        }
      });

      return max;
    } else {
      return 0;
    }
  }

  function loadWorks() {
    setLoading(false);
    return getAllWorks();
  }

  function handleShowSortClients() {
    if (showSortClients) {
      setShowSortClients(false);
    } else {
      if (showClients) {
        setShowSortClients(true);
      }
    }
    setTimeout(() => {
      if (showSortClients) {
        setShowSortClients(false);
      }
    }, 5000);
  }

  function handleShowSortWork() {
    if (showSortWork) {
      setShowSortWork(false);
    } else {
      if (showWorks) {
        setShowSortWork(true);
      }
    }
    setTimeout(() => {
      if (showSortWork) {
        setShowSortWork(false);
      }
    }, 5000);
  }
  /////////////////////////////////////
  function handleShowFilterClients() {
    if (showFilterClients) {
      setShowFilterClients(false);
    } else {
      if (showClients) {
        setShowFilterClients(true);
      }
    }
    setTimeout(() => {
      if (showFilterClients) {
        setShowFilterClients(false);
      }
    }, 5000);
  }

  function handleShowFilterWork() {
    if (showFilterWork) {
      setVisibleStatus(false);
      setShowFilterWork(false);
    } else {
      if (showWorks) {
        setShowFilterWork(true);
      }
    }
    setTimeout(() => {
      if (showFilterWork) {
        setShowFilterWork(false);
      }
    }, 5000);
  }

  /////////////////////////////////

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
      fetchCreatedTablesForWork(workId);
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

  const [workSortConfig, setWorkSortConfig] = useState({
    key: null,
    direction: 1
  });

  const [clientSortConfig, setClientSortConfig] = useState({
    key: null,
    direction: 1
  });

  const sortWorks = (key) => {
    let direction = 1;
    if (
      workSortConfig &&
      workSortConfig.key === key &&
      workSortConfig.direction === 1
    ) {
      direction = 2;
    }
    if (key === "Status") {
      direction =
        workSortConfig.direction === 5 ? 1 : workSortConfig.direction + 1;
    }
    setShowSortWork(false);
    setWorkSortConfig({ key, direction });
    const sorted = sorting(works, { key, direction });
    setWorkList(sorted);
  };

  const sortClients = (key) => {
    let direction = 1;
    if (
      clientSortConfig &&
      clientSortConfig.key === key &&
      clientSortConfig.direction === 1
    ) {
      direction = 2;
    }

    setShowSortClients(false);
    setClientSortConfig({ key, direction });
    const sorted = sorting(works, { key, direction });
    setClientList(sorted);
  };

  const [workFilterConfig, setWorkFilterConfig] = useState({
    key: null,
    upperLimit: null,
    lowerLimit: null
  });

  const [clientFilterConfig, setClientFilterConfig] = useState({
    key: null,
    upperLimit: null,
    lowerLimit: null
  });

  /////////////////////////////////
  const filterWorks = (key) => {
    let direction = 1;
    if (
      workFilterConfig &&
      workFilterConfig.key === key &&
      workFilterConfig.direction === 1
    ) {
      direction = 2;
    }
    if (key === "Status") {
      direction =
        workFilterConfig.direction === 5 ? 1 : workFilterConfig.direction + 1;
    }
    setShowFilterWork(false);
    setWorkFilterConfig({ key, direction });
    const filtered = filtering(works, { key, direction });
    setWorkList(filtered);
  };

  const filterClients = (key) => {
    let direction = 1;
    if (
      clientFilterConfig &&
      clientFilterConfig.key === key &&
      clientFilterConfig.direction === 1
    ) {
      direction = 2;
    }

    setShowFilterClients(false);
    setClientFilterConfig({ key, direction });
    const filtered = filtering(works, { key, direction });
    setClientList(filtered);
  };
  /////////////////////////////////

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

  const cellStyle = {
    verticalAlign: "middle",
    padding: "10px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap"
  };

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
                works.active
              ],
              backgroundColor: [
                "#FF6384",
                "#36A2EB",
                "#FFCD56",
                "#FF8A65",
                "#4BC0C0"
              ]
            }
          ]
        }
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
              backgroundColor: ["#4CAF50", "#FF9800"]
            }
          ]
        }
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
      {/* <Container className="d-xl-block pb-4">
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

        */}

      <Container className="d-xl-block pb-4">
        <div
          className="d-flex justify-content-between align-items-center"
          onClick={toggleClients}
          style={{
            cursor: "pointer"
          }}
        >
          <p className="fs-2 fw-bold text-start mb-0">Clients</p>

          <div style={{ position: "relative", display: "inline-block" }}>
            <Button
              variant="link"
              style={{ fontSize: "20px", textDecoration: "none" }}
              onClick={(e) => {
                e.stopPropagation();
                handleShowSortClients();
              }}
            >
              <IonIcon icon={options} />
            </Button>

            {showSortClients && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  right: 80,
                  backgroundColor: "white",
                  border: "1px solid #ccc",
                  padding: "8px",
                  zIndex: 1100,
                  width: "200px",
                  borderRadius: "2rem"
                }}
              >
                {clientSortOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant="outline-primary"
                    className="w-100 mb-2"
                    style={{
                      border: "none",
                      color: "black",
                      borderRadius: "3rem"
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      sortClients(option.value);
                    }}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            )}

            <Button
              variant="link"
              style={{ fontSize: "20px", textDecoration: "none" }}
              onClick={(e) => {
                e.stopPropagation();
                handleShowFilterClients();
              }}
            >
              <IonIcon icon={filter} />
            </Button>

            {showFilterClients && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  right: 80,
                  backgroundColor: "white",
                  border: "1px solid #ccc",
                  padding: "8px",
                  zIndex: 1100,
                  width: "200px",
                  borderRadius: "2rem",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)"
                }}
              >
                {clientFilterOptions
                  .filter((option) => option.type === "string")
                  .map((option) => (
                    <input
                      key={option.value}
                      type="text"
                      placeholder={option.label}
                      onChange={(e) =>
                        filterClients(option.value, e.target.value)
                      }
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        width: "100%",
                        padding: "6px",
                        borderRadius: "1rem",
                        border: "1px solid #ccc",
                        marginBottom: "8px"
                      }}
                    />
                  ))}
              </div>
            )}

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
            ) : clientList.length === 0 ? (
              <div
                style={{
                  padding: "1rem",
                  textAlign: "center",
                  color: "#666",
                  fontStyle: "italic"
                }}
              >
                Nincs még kliens, kérlek hozz létre egyet.
              </div>
            ) : (
              <div className="d-flex flex-nowrap overflow-x-scroll">
                {clients &&
                  clientList.map((client) => (
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
                        position: "relative" // A gombok számára referencia pozíció
                      }}
                      onClick={() => handleSelectClient(client.clientId)}
                    >
                      <p className="fw-bold">{client.name}</p>
                      <p>Tel: {client.telephone}</p>
                      <p>Address: {client.address}</p>
                      <div className="d-flex">
                        <p
                          className="fs-xs"
                          style={{ fontSize: "13px", color: "#6c757d" }}
                        >
                          Id: {client.clientId}
                        </p>
                      </div>

                      {/* A gombok elhelyezése a jobb alsó sarokban */}
                      <div
                        style={{
                          position: "absolute",
                          bottom: "10px", // Az alján 10px távolságra
                          right: "10px", // A jobb szélén 10px távolságra
                          display: "flex",
                          alignItems: "center"
                        }}
                      >
                        <Button
                          variant="primary"
                          onClick={(event) =>
                            handleModifyClient(event, client.clientId)
                          }
                          style={{
                            background: "transparent",
                            border: "none",
                            width: "30px"
                          }}
                        >
                          <IonIcon
                            icon={pencil}
                            style={{ fontSize: "20px", color: "#6c757d" }}
                          />
                        </Button>
                        <Button
                          variant="danger"
                          onClick={(event) =>
                            handleDeleteClient(event, client.clientId)
                          }
                          style={{
                            background: "transparent",
                            border: "none"
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
            cursor: "pointer"
          }}
        >
          <p className="fs-2 fw-bold text-start mb-3">Recent works</p>

          <div style={{ position: "relative", display: "inline-block" }}>
            <Button
              variant="link"
              style={{ fontSize: "20px", textDecoration: "none" }}
              onClick={(e) => {
                e.stopPropagation();
                handleShowSortWork();
              }}
            >
              <IonIcon icon={options} />
            </Button>

            {showSortWork && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  right: 80,
                  backgroundColor: "white",
                  border: "1px solid #ccc",
                  padding: "8px",
                  zIndex: 1100,
                  width: "200px",
                  borderRadius: "2rem"
                }}
              >
                {workSortOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant="outline-primary"
                    className="w-100 mb-2"
                    style={{
                      border: "none",
                      color: "black",
                      borderRadius: "3rem"
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      sortWorks(option.value);
                    }}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            )}

            <Button
              variant="link"
              style={{ fontSize: "20px", textDecoration: "none" }}
              onClick={(e) => {
                e.stopPropagation();
                handleShowFilterWork();
              }}
            >
              <IonIcon icon={filter} />
            </Button>

            {showFilterWork && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  right: 80,
                  backgroundColor: "white",
                  border: "1px solid #ccc",
                  padding: "8px",
                  zIndex: 1100,
                  width: "15vw",
                  borderRadius: "2rem"
                }}
              >
                {workFilterOptions.map((option) => {
                  // Ha az option típusa "string", akkor egy szöveges input jelenik meg
                  if (option.type === "string") {
                    return (
                      <div key={option.vkey}>
                        <div
                          style={{ marginBottom: "6px", fontWeight: "bold" }}
                        >
                          {option.label}
                        </div>
                        <input
                          type="text"
                          placeholder={option.label}
                          onChange={(e) =>
                            startFilter(
                              "works",
                              option.vkey,
                              "string",
                              "min",
                              e.target.value
                            )
                          }
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            width: "100%",
                            padding: "6px",
                            borderRadius: "1rem",
                            border: "1px solid #ccc",
                            marginBottom: "8px"
                          }}
                        />
                      </div>
                    );
                  }

                  // Ha az option típusa "interval", akkor két input mezőt jelenítünk meg (min, max)
                  if (option.type === "interval") {
                    const isDateInterval = option.vkey
                      .toLowerCase()
                      .includes("date");
                    return (
                      <div key={option.vkey} style={{ marginBottom: "12px" }}>
                        <div
                          style={{ marginBottom: "6px", fontWeight: "bold" }}
                        >
                          {option.label}
                        </div>

                        {isDateInterval ? (
                          <>
                            <input
                              type="date"
                              value={
                                option.min
                                  ? new Date(option.min)
                                      .toISOString()
                                      .split("T")[0]
                                  : ""
                              }
                              onChange={(e) => {
                                startFilter(
                                  "works",
                                  option.vkey,
                                  "interval",
                                  "min",
                                  e.target.value
                                );
                              }}
                              style={{
                                width: "47.5%",
                                padding: "6px",
                                borderRadius: "1rem",
                                border: "1px solid #ccc",
                                marginRight: "10px",
                                marginBottom: "8px"
                              }}
                            />

                            <input
                              type="date"
                              value={
                                option.max
                                  ? new Date(option.max)
                                      .toISOString()
                                      .split("T")[0]
                                  : ""
                              }
                              onChange={(e) => {
                                startFilter(
                                  "works",
                                  option.vkey,
                                  "interval",
                                  "max",
                                  e.target.value
                                );
                              }}
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                width: "47.5%",
                                padding: "6px",
                                borderRadius: "1rem",
                                border: "1px solid #ccc",
                                marginBottom: "8px"
                              }}
                            />
                          </>
                        ) : (
                          <>
                            <input
                              type="number"
                              value={option.min}
                              onChange={(e) => {
                                startFilter(
                                  "works",
                                  option.vkey,
                                  "interval",
                                  "min",
                                  e.target.value
                                );
                              }}
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                width: "47.5%",
                                padding: "6px",
                                borderRadius: "1rem",
                                border: "1px solid #ccc",
                                marginRight: "10px",
                                marginBottom: "8px"
                              }}
                            />
                            <input
                              type="number"
                              placeholder={loadMinMax(
                                "works",
                                option.vkey,
                                "max"
                              )}
                              onChange={(e) => {
                                startFilter(
                                  "works",
                                  option.vkey,
                                  "interval",
                                  "max",
                                  e.target.value
                                );
                              }}
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                width: "47.5%",
                                padding: "6px",
                                borderRadius: "1rem",
                                border: "1px solid #ccc",
                                marginBottom: "8px"
                              }}
                            />
                          </>
                        )}
                      </div>
                    );
                  }

                  if (option.type === "valueList") {
                    return (
                      <div key={option.vkey}>
                        <div
                          style={{
                            marginBottom: "6px",
                            fontWeight: "bold",
                            cursor: "pointer"
                          }}
                          onClick={handleToggleVisibility} // Kattintásra váltja a láthatóságot
                        >
                          {option.label}
                        </div>

                        {/* Ha az isVisible igaz, akkor jelenik meg a blokk */}
                        {visibleStatus && (
                          <div
                            style={{
                              paddingLeft: "10px",
                              marginTop: "10px",
                              position: "relative"
                            }}
                          >
                            <div
                              style={{
                                paddingLeft: "10px",
                                position: "absolute",
                                right: 280,
                                top: -40,
                                backgroundColor: "white",
                                padding: "1rem",
                                border: "thin solid #dee2e6",
                                zIndex: "1500",
                                borderRadius: "1.5rem",
                                textAlign: "right",
                                width: "8rem",
                                paddingRight: "0rem"
                              }}
                            >
                              <div>
                                {option.values.map((status, index) => (
                                  <div
                                    key={index}
                                    style={{
                                      height: "2.5rem",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "flex-end", // Minden tartalom jobbra kerül
                                      gap: "10px", // Kis térköz a szöveg és az ikon között
                                      paddingRight: "5px", // Kis térköz a jobb oldaltól
                                      cursor: "pointer"
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      startFilter(
                                        "works",
                                        option.vkey,
                                        "valueList",
                                        "noaction",
                                        status
                                      );
                                    }}
                                  >
                                    <p style={{ margin: 0 }}>{status}</p>
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        width: "24px",
                                        height: "24px"
                                      }}
                                    >
                                      <IonIcon
                                        icon={
                                          option.value.includes(status)
                                            ? radioButtonOn
                                            : radioButtonOffOutline
                                        }
                                        style={{
                                          fontSize: "20px",
                                          color: "#6c757d"
                                        }}
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            )}

            <Button
              variant="link"
              style={{ fontSize: "24px", textDecoration: "none" }}
            >
              {showWorks ? "−" : "+"}
            </Button>
          </div>
        </div>
        {showWorks &&
          (works.length === 0 ? (
            <div
              style={{
                padding: "1rem",
                textAlign: "center",
                color: "#666",
                fontStyle: "italic"
              }}
            >
              Nincs még munka, kérlek hozz létre egyet.
            </div>
          ) : (
            <>
              <div
                style={{
                  borderRadius: "0.25rem",
                  overflow: "hidden"
                }}
              >
                {/* Scroll container for the table body */}
                <div
                  style={{
                    maxHeight: 540,
                    overflowY: "auto"
                  }}
                >
                  <Table
                    striped
                    hover
                    responsive
                    className="w-100"
                    style={{
                      tableLayout: "fixed",
                      borderCollapse: "collapse",
                      backgroundColor: "white",
                      color: "black",
                      padding: "0"
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          zIndex: 15
                        }}
                      >
                        {[
                          "Work ID",
                          "Client",
                          "Name",
                          "Paid",
                          "Price",
                          "Label",
                          "Status",
                          "Measured",
                          "Ordered",
                          "Completed"
                        ].map((title, idx) => (
                          <th
                            key={idx}
                            style={{
                              position: "sticky",
                              top: 0,
                              backgroundColor: "#E9E7F1",
                              zIndex: 10,
                              padding: "10px",
                              boxShadow: "inset 0px -5px 0px black",
                              textAlign: "left",
                              width: `${100 / 9}%`, // 10 equal columns
                              boxSizing: "border-box"
                            }}
                          >
                            {title}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {workList.map((work) => (
                        <tr
                          key={work.workId}
                          onClick={() => handleRowClick(work.workId)}
                          style={{
                            cursor: "pointer",
                            borderBottom: "thin solid #E9E7F1",
                            height: "50"
                          }}
                        >
                          <td style={cellStyle}>{work.workId}</td>
                          <td style={cellStyle}>{work.client.name}</td>
                          <td style={cellStyle}>{work.name}</td>
                          <td style={cellStyle}>{work.clientPaid || 0}</td>
                          <td style={cellStyle}>{work.clientPrice || 0}</td>
                          <td style={cellStyle}>{work.label}</td>
                          <td style={cellStyle}>{work.status}</td>
                          <td style={cellStyle}>
                            {formatDate(work.measureDate) || "--"}
                          </td>
                          <td style={cellStyle}>
                            {formatDate(work.ordereDate) || "--"}
                          </td>
                          <td style={cellStyle}>
                            {formatDate(work.finishDate) || "--"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </div>
            </>
          ))}
      </div>
    </div>
  );
}

export default UserDashboard;
