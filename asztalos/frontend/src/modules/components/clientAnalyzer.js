import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { Table, Button, Modal } from "react-bootstrap";
import { IonIcon } from "@ionic/react";
import {
  filter,
  options,
  trash,
  radioButtonOn,
  radioButtonOffOutline
} from "ionicons/icons";
import Loading from "../helpers/Loading";
import ClientUpdateModal from "../modals/ClientUpdateModal";
import NewWorkModal from "../modals/newWorkModal.js";
import {
  fetchCreatedItemsForWork,
  fetchCreatedTablesForWork,
  fetchObjectsForWork,
  fetchTables
} from "../../data/storeManager";
import sorting from "../helpers/sort";
import filtering from "../helpers/filter"; // Assuming this exists or needs to be implemented
import clientApi from "../../data/api/clientApi";
import workApi from "../../data/api/workApi";
import { getClientById, getAllWorks } from "../../data/getters";
import { selectWork } from "../../data/store/actions/workStoreFunctions";
import ErrorModal from "../helpers/ErrorModal";

function ClientAnalyzer() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { clientId } = useParams();

  const [showNewWork, setShowNewWork] = useState(false);
  const [showClientUpdateModal, setShowClientUpdateModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [render, setRender] = useState(true);
  const [error, setError] = useState("");
  const [showSortWork, setShowSortWork] = useState(false);
  const [showFilterWork, setShowFilterWork] = useState(false);
  const [workSortConfig, setWorkSortConfig] = useState({
    key: null,
    direction: 1
  });
  const [workFilterOptions, setWorkFilterOptions] = useState([]);
  const [visibleStatus, setVisibleStatus] = useState(false);
  const [allWorks, setAllWorks] = useState(
    useSelector((state) => state.works || [])
  );
  const [clientWorks, setClientsWorks] = useState(
    allWorks.filter((work) => work.client.clientId == clientId)
  );

  // Load client data
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const clientData = await dispatch(getClientById(clientId));
        setSelectedClient(clientData);
        setWorkFilterOptions([
          { label: "Name", vkey: "name", type: "string", value: "" },
          {
            label: "Paid",
            vkey: "paid",
            type: "interval",
            min: getMin(clientWorks, "paid"),
            max: getMax(clientWorks, "paid")
          },
          {
            label: "Price",
            vkey: "price",
            type: "interval",
            min: getMin(clientWorks, "price"),
            max: getMax(clientWorks, "price")
          },
          {
            label: "Status",
            vkey: "status",
            type: "valueList",
            values: getValues(clientWorks, "status"),
            value: getValues(clientWorks, "status")
          }
        ]);
      } catch (err) {
        setError("Failed to load client data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [render, clientId, dispatch]);

  useEffect(() => {
    setClientsWorks(
      allWorks.filter((work) => work.client.clientId == clientId)
    );
    setRender(!render);
  }, [allWorks]);

  // Helper functions for filtering
  const getMin = (items, key) => {
    if (!Array.isArray(items)) return 0;
    let min = -1;
    items.forEach((item) => {
      const value = item[key];
      if (min === -1 && value != null) min = value;
      if (value != null && value < min) min = value;
    });
    return min;
  };

  const getMax = (items, key) => {
    if (!Array.isArray(items)) return 0;
    let max = -1;
    items.forEach((item) => {
      const value = item[key];
      if (max === -1 && value != null) max = value;
      if (value != null && value > max) max = value;
    });
    return max;
  };

  const getValues = (items, key) => {
    if (!Array.isArray(items)) return [];
    const values = [];
    items.forEach((item) => {
      if (item[key] && !values.includes(item[key])) values.push(item[key]);
    });
    return values;
  };

  // Sorting
  const sortWorks = (key) => {
    let direction = 1;
    if (
      workSortConfig &&
      workSortConfig.key === key &&
      workSortConfig.direction === 1
    ) {
      direction = 2;
    }
    setShowSortWork(false);
    setWorkSortConfig({ key, direction });
    const sorted = sorting([...clientWorks], { key, direction });
    setWorkList(sorted);
  };

  // Filtering
  const startFilter = (key, type, actionType, value) => {
    let updatedWorkConfig = workFilterOptions.map((config) => {
      if (config.vkey === key) {
        let newConfig = { ...config };
        if (type === "string") {
          newConfig.value = value;
        } else if (type === "interval") {
          if (actionType === "min") newConfig.min = value;
          else newConfig.max = value;
        } else if (type === "valueList") {
          if (newConfig.value.includes(value)) {
            newConfig.value = newConfig.value.filter((val) => val !== value);
          } else {
            newConfig.value = [...newConfig.value, value];
          }
        }
        return newConfig;
      }
      return config;
    });
    setWorkFilterOptions(updatedWorkConfig);
    const filtered = filtering(clientWorks, updatedWorkConfig);
    setWorkList(filtered);
  };

  const handleToggleVisibility = () => {
    if (showFilterWork) setVisibleStatus(!visibleStatus);
  };

  const [workList, setWorkList] = useState(clientWorks);

  // Rerender function
  const rerender = () => setRender(!render);

  // Navigation to workAnalyzer
  const handleRowClick = async (workId) => {
    setLoading(true);
    try {
      dispatch(selectWork(workId));
      await fetchTables(workId);
      await fetchObjectsForWork(workId);
      await fetchCreatedItemsForWork(workId);
      await fetchCreatedTablesForWork(workId);
      navigate(`/workAnalyzer/${workId}`);
    } catch (error) {
      setError("Nem sikerült kiválasztani a munkát, próbáld újra később.");
      console.error("Error selecting work:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewWorkClick = () => setShowNewWork(true);
  const closeNewWork = () => setShowNewWork(false);

  const handleNewWork = async (newWork) => {
    try {
      await dispatch(workApi.createWorkApi(newWork));
      setShowNewWork(false);
      // 1) Újra lekérjük az összes work-ot
      const freshWorks = await dispatch(getAllWorks());
      // 2) Frissítjük a teljes listát
      setAllWorks(freshWorks);
      // 3) Kiszűrjük a kliens munkáit
      const filtered = freshWorks.filter(
        (w) => String(w.client.clientId) === String(clientId)
      );
      setClientsWorks(filtered);
      // 4) Frissítjük a látható workListet is
      setWorkList(filtered);
    } catch (error) {
      setError("Nem sikerült létrehozni a munkát, próbld meg később.");
      console.error("Error creating new work:", error);
    }
  };

  const handleWorkDelete = async (event, workId) => {
    event.stopPropagation();
    try {
      await dispatch(workApi.deleteWorkApi(workId));
      rerender();
    } catch (error) {
      setError("Nem sikerült törölni a munkát, próbld meg később.");
      console.error("Error deleting work:", error);
    }
  };

  const handleClientUpdateClose = () => setShowClientUpdateModal(false);

  const handleClientUpdate = async (updatedClientData) => {
    try {
      await dispatch(
        clientApi.updateClientApi(selectedClient.clientId, updatedClientData)
      );
      setShowClientUpdateModal(false);
      rerender();
    } catch (error) {
      setError("Nem sikerült frissíteni a klienst, próbld meg később.");
      console.error("Error updating client:", error);
    }
  };

  const handleCloseErrorModal = () => setError("");

  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleDateString("hu-HU") : "--";
  };

  const workSortOptions = [
    { label: "Name", value: "name" },
    { label: "Paid", value: "paid" },
    { label: "Price", value: "price" },
    { label: "Status", value: "status" },
    { label: "Ordered", value: "orderDate" },
    { label: "Completed", value: "finishDate" }
  ];

  return (
    <div style={{ height: "100vh", overflow: "hidden" }}>
      <div
        className="container d-xl-block"
        style={{ height: "100%", display: "flex", flexDirection: "column" }}
      >
        {loading ? (
          <Loading />
        ) : (
          <>
            {error && (
              <ErrorModal error={error} onClose={handleCloseErrorModal} />
            )}
            {selectedClient ? (
              <>
                <Modal show={showNewWork} onHide={closeNewWork}>
                  <Modal.Header closeButton>
                    <Modal.Title>Új munka létrehozása</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <NewWorkModal
                      show={showNewWork}
                      handleClose={closeNewWork}
                      onSubmit={handleNewWork}
                    />
                  </Modal.Body>
                </Modal>
                <Modal
                  show={showClientUpdateModal}
                  onHide={handleClientUpdateClose}
                >
                  <Modal.Header closeButton>
                    <Modal.Title>Kliens frissítése</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <ClientUpdateModal
                      handleClose={handleClientUpdateClose}
                      clientId={selectedClient?.clientId}
                      onUpdate={handleClientUpdate}
                    />
                  </Modal.Body>
                </Modal>

                <div className="d-flex justify-content-between align-items-center mb-3">
                  <p className="fs-1 text-start mb-0">
                    <strong>{selectedClient?.name} </strong>
                    munkái
                  </p>
                  <div>
                    <Button
                      variant="primary"
                      onClick={() => setShowClientUpdateModal(true)}
                      className="me-3"
                    >
                      Kliens szerkesztés
                    </Button>
                    <Button variant="primary" onClick={handleNewWorkClick}>
                      Új munka
                    </Button>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="fs-2 fw-bold text-start">Részletek</p>
                  <div className="row">
                    <div className="col-md-6">
                      <p className="fs-5 text-start">
                        Telefonszám: <span>{selectedClient?.telephone}</span>
                      </p>
                    </div>
                    <div className="col-md-6">
                      <p className="fs-5 text-start">
                        Cím: <span>{selectedClient?.address}</span>
                      </p>
                    </div>
                    <div className="col-md-6">
                      <p className="fs-5 text-start">
                        Munkák száma: <span>{clientWorks.length}</span>
                      </p>
                    </div>
                    <div className="col-md-6">
                      <p className="fs-5 text-start">
                        Aktív munkák:{" "}
                        <span>
                          {
                            clientWorks.filter((w) => w.status === "Active")
                              .length
                          }
                        </span>
                      </p>
                    </div>
                    <div className="col-md-6">
                      <p className="fs-5 text-start">
                        Kész munkák:{" "}
                        <span>
                          {
                            clientWorks.filter((w) => w.status === "Completed")
                              .length
                          }
                        </span>
                      </p>
                    </div>
                    <div className="col-md-6">
                      <p className="fs-5 text-start">
                        Még fizetnie kell:{" "}
                        <span>{selectedClient?.clientSold} RON</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-3">
                  <p className="fs-2 fw-bold text-start mb-0">Korábbi munkák</p>
                  <div
                    style={{ position: "relative", display: "inline-block" }}
                  >
                    <Button
                      variant="link"
                      style={{ fontSize: "20px", textDecoration: "none" }}
                      onClick={() => setShowSortWork(!showSortWork)}
                    >
                      <IonIcon icon={options} />
                    </Button>
                    {showSortWork && (
                      <div
                        style={{
                          position: "absolute",
                          top: "100%",
                          right: 0,
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
                            onClick={() => sortWorks(option.value)}
                          >
                            {option.label}
                          </Button>
                        ))}
                      </div>
                    )}
                    <Button
                      variant="link"
                      style={{ fontSize: "20px", textDecoration: "none" }}
                      onClick={() => setShowFilterWork(!showFilterWork)}
                    >
                      <IonIcon icon={filter} />
                    </Button>
                    {showFilterWork && (
                      <div
                        style={{
                          position: "absolute",
                          top: "100%",
                          right: 0,
                          backgroundColor: "white",
                          border: "1px solid #ccc",
                          padding: "8px",
                          zIndex: 1100,
                          width: "15vw",
                          borderRadius: "2rem"
                        }}
                      >
                        {workFilterOptions.map((option) => {
                          if (option.type === "string") {
                            return (
                              <div key={option.vkey}>
                                <div
                                  style={{
                                    marginBottom: "6px",
                                    fontWeight: "bold"
                                  }}
                                >
                                  {option.label}
                                </div>
                                <input
                                  type="text"
                                  placeholder={option.label}
                                  onChange={(e) =>
                                    startFilter(
                                      option.vkey,
                                      "string",
                                      "min",
                                      e.target.value
                                    )
                                  }
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
                          if (option.type === "interval") {
                            const isDateInterval = option.vkey
                              .toLowerCase()
                              .includes("date");
                            return (
                              <div
                                key={option.vkey}
                                style={{ marginBottom: "12px" }}
                              >
                                <div
                                  style={{
                                    marginBottom: "6px",
                                    fontWeight: "bold"
                                  }}
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
                                      onChange={(e) =>
                                        startFilter(
                                          option.vkey,
                                          "interval",
                                          "min",
                                          e.target.value
                                        )
                                      }
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
                                      onChange={(e) =>
                                        startFilter(
                                          option.vkey,
                                          "interval",
                                          "max",
                                          e.target.value
                                        )
                                      }
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
                                      value={option.min || ""}
                                      onChange={(e) =>
                                        startFilter(
                                          option.vkey,
                                          "interval",
                                          "min",
                                          e.target.value
                                        )
                                      }
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
                                      value={option.max || ""}
                                      onChange={(e) =>
                                        startFilter(
                                          option.vkey,
                                          "interval",
                                          "max",
                                          e.target.value
                                        )
                                      }
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
                                  onClick={handleToggleVisibility}
                                >
                                  {option.label}
                                </div>
                                {visibleStatus && (
                                  <div
                                    style={{
                                      position: "absolute",
                                      right: 0,
                                      top: "100%",
                                      backgroundColor: "white",
                                      padding: "1rem",
                                      border: "thin solid #dee2e6",
                                      zIndex: "1500",
                                      borderRadius: "1.5rem",
                                      width: "8rem"
                                    }}
                                  >
                                    {option.values.map((status) => (
                                      <div
                                        key={status}
                                        style={{
                                          height: "2.5rem",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "space-between",
                                          cursor: "pointer"
                                        }}
                                        onClick={() =>
                                          startFilter(
                                            option.vkey,
                                            "valueList",
                                            "noaction",
                                            status
                                          )
                                        }
                                      >
                                        <p style={{ margin: 0 }}>{status}</p>
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
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          }
                          return null;
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    flex: 1,
                    overflowY: "auto",
                    border: "thin solid #dee2e6",
                    borderRadius: "0.25rem"
                  }}
                >
                  <Table
                    striped
                    hover
                    responsive
                    style={{ width: "100%", margin: 0 }}
                  >
                    <thead
                      style={{
                        position: "sticky",
                        top: 0,
                        backgroundColor: "#E9E7F1",
                        borderBottom: "5px solid black",
                        zIndex: 10
                      }}
                    >
                      <tr>
                        <th style={{ padding: "10px", textAlign: "left" }}>
                          Név
                        </th>
                        <th style={{ padding: "10px", textAlign: "left" }}>
                          Fizetve
                        </th>
                        <th style={{ padding: "10px", textAlign: "left" }}>
                          Teljes ár
                        </th>
                        <th style={{ padding: "10px", textAlign: "left" }}>
                          Munkadíj
                        </th>
                        <th style={{ padding: "10px", textAlign: "left" }}>
                          Állapot
                        </th>
                        <th style={{ padding: "10px", textAlign: "left" }}>
                          Rendelés dátuma
                        </th>
                        <th style={{ padding: "10px", textAlign: "left" }}>
                          Befejezés dátuma
                        </th>
                        <th style={{ padding: "10px", textAlign: "left" }}>
                          Műveletek
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {workList.length === 0 ? (
                        <tr>
                          <td
                            colSpan="8"
                            style={{ textAlign: "center", padding: "10px" }}
                          >
                            Még nincs munka, hozz létre egyet.
                          </td>
                        </tr>
                      ) : (
                        workList.map((work) => (
                          <tr
                            key={work.workId}
                            onClick={() => handleRowClick(work.workId)}
                            style={{
                              cursor: "pointer",
                              borderBottom: "thin solid #E9E7F1"
                            }}
                          >
                            <td style={{ padding: "10px", textAlign: "left" }}>
                              {work.name || "N/A"}
                            </td>
                            <td style={{ padding: "10px", textAlign: "left" }}>
                              {work.clientpaid || "0"}
                            </td>
                            <td style={{ padding: "10px", textAlign: "left" }}>
                              {work.clientPrice || "0"}
                            </td>
                            <td style={{ padding: "10px", textAlign: "left" }}>
                              {work.label || "0"}
                            </td>
                            <td style={{ padding: "10px", textAlign: "left" }}>
                              {work.status || "N/A"}
                            </td>
                            <td style={{ padding: "10px", textAlign: "left" }}>
                              {formatDate(work.orderDate)}
                            </td>
                            <td style={{ padding: "10px", textAlign: "left" }}>
                              {formatDate(work.finishDate)}
                            </td>
                            <td style={{ padding: "10px", textAlign: "left" }}>
                              <Button
                                style={{
                                  color: "red",
                                  border: "none",
                                  background: "none",
                                  cursor: "pointer"
                                }}
                                onClick={(e) =>
                                  handleWorkDelete(e, work.workId)
                                }
                              >
                                <IonIcon
                                  icon={trash}
                                  style={{ fontSize: "20px" }}
                                />
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </div>
              </>
            ) : (
              <div className="d-flex justify-content-center mt-3">
                <ErrorModal
                  error="There is no client to load"
                  onClose={handleCloseErrorModal}
                />
                <Button
                  variant="primary"
                  onClick={() => navigate("/UserDashboard")}
                >
                  Vissza a kezdőlapra
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ClientAnalyzer;
