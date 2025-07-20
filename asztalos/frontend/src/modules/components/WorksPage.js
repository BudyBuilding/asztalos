import React, { useState, useEffect, useRef } from "react";
import { Table, Button } from "react-bootstrap";
import { IonIcon } from "@ionic/react";
import {
  filter,
  options,
  trash,
  radioButtonOn,
  radioButtonOffOutline,
  star
} from "ionicons/icons";
import { useDispatch, useSelector } from "react-redux";
import { getAllWorks, getWorkById } from "../../data/getters";
import Loading from "../helpers/Loading";
import { selectWork } from "../../data/store/actions/workStoreFunctions";
import { useNavigate } from "react-router-dom";
import {
  fetchCreatedItemsForWork,
  fetchCreatedTablesForWork,
  fetchObjectsForWork,
  fetchTables
} from "../../data/storeManager";
import { selectClient } from "../../data/store/actions/clientStoreFunctions";
import sorting from "../helpers/sort";
import filtering from "../helpers/filter";

function WorksPage() {
  const [workList, setWorkList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSortWork, setShowSortWork] = useState(false);
  const [showFilterWork, setShowFilterWork] = useState(false);
  const [workSortConfig, setWorkSortConfig] = useState({
    key: null,
    direction: 1
  });
  const [workFilterOptions, setWorkFilterOptions] = useState([]);
  const [visibleStatus, setVisibleStatus] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const works = useSelector((state) => state.works || []);

  const tableContainerRef = useRef(null);
  useEffect(() => {
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleWheel = (e) => {
      if (
        tableContainerRef.current &&
        !tableContainerRef.current.contains(e.target)
      ) {
        e.preventDefault();
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      document.body.style.overflow = orig;
      window.removeEventListener("wheel", handleWheel);
    };
  }, []);

  // Segédfüggvények
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
    if (!Array.isArray(items)) {
      console.error("items is not an array:", items);
      return [];
    }
    const values = [];
    items.forEach((item) => {
      if (item[key] && !values.includes(item[key])) values.push(item[key]);
    });
    return values;
  };

  // Adatok betöltése Redux-ból
  useEffect(() => {
    async function loadWorks() {
      try {
        await dispatch(getAllWorks());
        setLoading(false);
      } catch (error) {
        console.error("Error loading works:", error);
        setLoading(false);
      }
    }
    loadWorks();
  }, [dispatch]);

  // Works állapot változásakor frissítjük a workList-et és a filter opciókat
  useEffect(() => {
    if (Array.isArray(works)) {
      setWorkList(works);
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
    }
  }, [works]);

  // Rendezés
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
    const sorted = sorting([...workList], { key, direction });
    setWorkList(sorted);
  };

  // Szűrés
  const startFilter = (key, type, actionType, value) => {
    let updatedWorkConfig = workFilterOptions.map((config) => {
      if (config.vkey === key) {
        let newConfig = { ...config };
        if (type === "string") {
          newConfig.value = value;
        } else if (type === "interval") {
          if (actionType === "min") {
            newConfig.min = value;
          } else {
            newConfig.max = value;
          }
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
    const filtered = filtering([...works], updatedWorkConfig);
    setWorkList(filtered);
  };

  const handleToggleVisibility = () => {
    if (showFilterWork) setVisibleStatus(!visibleStatus);
  };

  const handleRowClick = async (workId) => {
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

  const handleDeleteWork = (event, workId) => {
    event.stopPropagation();
    console.log(`Delete work with ID: ${workId}`);
  };

  const formatDate = (dateString) => {
    if (dateString) return new Date(dateString).toLocaleDateString("hu-HU");
    return "N/A";
  };

  const workSortOptions = [
    { label: "Client", value: "client.name" },
    { label: "Name", value: "name" },
    { label: "Paid", value: "paid" },
    { label: "Status", value: "status" },
    { label: "Measured", value: "measureDate" },
    { label: "Ordered", value: "orderDate" },
    { label: "Completed", value: "finishDate" }
  ];

  return (
    <div className="pb-5">
      <div className="container d-xl-block">
        {/* Cím és gombok konténere */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h1>Munkák</h1>
          <div style={{ position: "relative", display: "inline-block" }}>
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
                          style={{ marginBottom: "6px", fontWeight: "bold" }}
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
                                  style={{ fontSize: "20px", color: "#6c757d" }}
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

        {/* Táblázat konténere */}
        {loading ? (
          <Loading />
        ) : (
          <div
            style={{
              maxHeight: "80vh",
              overflowY: "auto",
              border: "thin solid #dee2e6",
              borderRadius: "0.25rem"
            }}
            ref={tableContainerRef}
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
                    Azonosító
                  </th>
                  <th style={{ padding: "10px", textAlign: "left" }}>Kliens</th>
                  <th style={{ padding: "10px", textAlign: "left" }}>
                    Munka neve
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
                    Felmért
                  </th>
                  <th style={{ padding: "10px", textAlign: "left" }}>
                    Rendelt
                  </th>
                  <th style={{ padding: "10px", textAlign: "left" }}>
                    Befejezett
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
                      colSpan="10"
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
                        {work.workId || "N/A"}
                      </td>
                      <td style={{ padding: "10px", textAlign: "left" }}>
                        {work.client?.name || "N/A"}
                      </td>
                      <td style={{ padding: "10px", textAlign: "left" }}>
                        {work.name || "N/A"}
                      </td>
                      <td style={{ padding: "10px", textAlign: "left" }}>
                        {work.paid || "0"}
                      </td>
                      <td style={{ padding: "10px", textAlign: "left" }}>
                        {work.price || "0"}
                      </td>
                      <td style={{ padding: "10px", textAlign: "left" }}>
                        {work.label || "N/A"}
                      </td>
                      <td style={{ padding: "10px", textAlign: "left" }}>
                        {work.status || "N/A"}
                      </td>
                      <td style={{ padding: "10px", textAlign: "left" }}>
                        {formatDate(work.measureDate)}
                      </td>
                      <td style={{ padding: "10px", textAlign: "left" }}>
                        {formatDate(work.orderDate)}
                      </td>
                      <td style={{ padding: "10px", textAlign: "left" }}>
                        {formatDate(work.finishDate)}
                      </td>
                      <td style={{ padding: "10px", textAlign: "left" }}>
                        {!work.isOrdered && (
                          <Button
                            style={{
                              color: "red",
                              border: "none",
                              background: "none",
                              cursor: "pointer"
                            }}
                            onClick={(e) => handleDeleteWork(e, work.workId)}
                          >
                            <IonIcon
                              icon={trash}
                              style={{ fontSize: "20px" }}
                            />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}

export default WorksPage;
