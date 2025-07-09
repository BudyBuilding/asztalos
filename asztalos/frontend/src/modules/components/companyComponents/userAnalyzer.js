import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { Table, Button, Modal } from "react-bootstrap";
import { IonIcon } from "@ionic/react";
import { filter as filterIcon, options } from "ionicons/icons";
import Loading from "../../helpers/Loading";
import sorting from "../../helpers/sort";
import filtering from "../../helpers/filter";
import { getUserById } from "../../../data/getters";
import ErrorModal from "../../helpers/ErrorModal";
import authApi from "../../../data/api/authApi";

function UserAnalyzer() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userId } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [renderFlag, setRenderFlag] = useState(true);

  const [showSortWork, setShowSortWork] = useState(false);
  const [showFilterWork, setShowFilterWork] = useState(false);
  const [workSortConfig, setWorkSortConfig] = useState({ key: null, direction: 1 });
  const [workFilterOptions, setWorkFilterOptions] = useState([]);
  const [visibleFilter, setVisibleFilter] = useState(false);

  const [showCreate, setShowCreate] = useState(false);
const [createForm, setCreateForm] = useState({
  name: "",
  username: "",
  email: "",
  address: "",
});
const [creating, setCreating] = useState(false);
const [createErr, setCreateErr] = useState("");
const currentUser = useSelector((s) => s.auth.user);
  // A Redux-store-ból vesszük az összes munkát, majd kiszűrjük a user-hez tartozókat
  const allWorks = useSelector((state) => state.works || []);
  console.log(allWorks)
    const userWorks = allWorks.filter((w) => {
        console.log("w: ", w)
    const matches = String(w.user.userId) === String(userId) && w.isOrdered === true;
    return matches;
    });
  // --- Felhasználó és inicializáló logika ---
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // Lekérjük a felhasználó adatait
        const userData = await getUserById(userId);
        if (!userData) {
          throw new Error("User not found");
        }
        setSelectedUser(userData);

        // Normáljuk a userWorks tömböt, hogy legyen minden munkában paid és price érték
        const normalized = userWorks.map((w) => ({
          ...w,
          paid: w.paid != null ? w.paid : 0,
          price: w.price != null ? w.price : 0,
        }));

        // Inicializáljuk a szűrő-opciókat
        setWorkFilterOptions([
          {
            label: "Name",
            vkey: "name",
            type: "string",
            value: "",
          },
          {
            label: "Paid",
            vkey: "paid",
            type: "interval",
            min: getMin(normalized, "paid"),
            max: getMax(normalized, "paid"),
            value: { min: getMin(normalized, "paid"), max: getMax(normalized, "paid") },
          },
          {
            label: "Price",
            vkey: "price",
            type: "interval",
            min: getMin(normalized, "price"),
            max: getMax(normalized, "price"),
            value: { min: getMin(normalized, "price"), max: getMax(normalized, "price") },
          },
          {
            label: "Status",
            vkey: "status",
            type: "valueList",
            values: getValues(userWorks, "status"),
            value: getValues(userWorks, "status"),
          },
        ]);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load user data");
      } finally {
        setLoading(false);
      }
    }

    loadData();
    // Csak akkor fut újra, ha userId vagy renderFlag változik
  }, [renderFlag, userId, dispatch]);

  // --- Helper függvények a min/max/values kiszámításához ---
  const getMin = (items, key) => {
    if (!items.length) return 0;
    return items.reduce((acc, item) => {
      const val = item[key] != null ? item[key] : 0;
      if (acc < 0 || val < acc) return val;
      return acc;
    }, -1);
  };
  const getMax = (items, key) => {
    if (!items.length) return 0;
    return items.reduce((acc, item) => {
      const val = item[key] != null ? item[key] : 0;
      if (acc < 0 || val > acc) return val;
      return acc;
    }, -1);
  };
  const getValues = (items, key) => {
    if (!items.length) return [];
    const setVals = new Set();
    items.forEach((i) => {
      if (i[key]) setVals.add(i[key]);
    });
    return Array.from(setVals);
  };

  // --- A _szűrt és rendezett_ munkalistát memoizáljuk useMemo-val ---
  const workList = useMemo(() => {
    // Normalizáljuk a userWorks-öt (biztos, hogy paid/price értékek számok)
    const normalized = userWorks.map((w) => ({
      ...w,
      paid: w.paid != null ? w.paid : 0,
      price: w.price != null ? w.price : 0,
    }));

    // 1) Alkalmazzuk a szűrőket
    let temp = filtering(normalized, workFilterOptions);

    // 2) Alkalmazzuk a rendezést, ha van key
    if (workSortConfig.key) {
      temp = sorting(temp, workSortConfig);
    }

    return temp;
  }, [userWorks, workFilterOptions, workSortConfig]);

  // --- Rendezés kezelése ---
  const sortWorks = (key) => {
    let direction = 1;
    if (workSortConfig.key === key && workSortConfig.direction === 1) {
      direction = 2;
    }
    setShowSortWork(false);
    setWorkSortConfig({ key, direction });
  };

  // --- Szűrés kezelése ---
  const startFilter = (vkey, type, actionType, value) => {
    const updatedOptions = workFilterOptions.map((opt) => {
      if (opt.vkey === vkey) {
        const newOpt = { ...opt };
        if (type === "string") {
          newOpt.value = value;
        } else if (type === "interval") {
          newOpt.value = {
            ...newOpt.value,
            [actionType]: value,
          };
        } else if (type === "valueList") {
          // értéklis­tásnál a newOpt.value egy tömb, csak belepakoljuk/kitöröljük a státuszt
          if (newOpt.value.includes(value)) {
            newOpt.value = newOpt.value.filter((v) => v !== value);
          } else {
            newOpt.value = [...newOpt.value, value];
          }
        }
        return newOpt;
      }
      return opt;
    });
    setWorkFilterOptions(updatedOptions);
  };

  const handleDeleteUser = async () => {
    if (!window.confirm("Biztosan törölni szeretnéd ezt a felhasználót?")) return;
    try {
      setLoading(true);
      await authApi.deleteUserApi(userId);
      // siker esetén vissza a dashboardra (vagy máshová)
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err.message || "Felhasználó törlése sikertelen.");
    } finally {
      setLoading(false);
    }
  };

  // --- Visszahűzéshez flag ---
  const rerender = () => setRenderFlag(!renderFlag);

  // --- Szűrő panel láthatóságának váltása ---
  const handleToggleVisibility = () => {
    if (showFilterWork) setVisibleFilter(!visibleFilter);
  };

  // --- Sorra kattintva: WorkAnalyzer-ra navigálunk ---
  const handleRowClick = (workId) => {
    navigate(`/workAnalyzer/${workId}`);
  };

  const handleCloseErrorModal = () => setError("");

  return (
    <div style={{ height: "100vh", overflow: "hidden" }}>
      <div
        className="container d-xl-block"
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {loading ? (
          <Loading />
        ) : (
          <>
            {error && <ErrorModal error={error} onClose={handleCloseErrorModal} />}

            {selectedUser ? (
              <>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <p className="fs-1 fw-bold text-start mb-0">
                    {selectedUser.name}'s Works
                  </p>
                </div>
            {(currentUser.role === "admin" || currentUser.role === "companyAdmin") && (
              <Button 
                variant="outline-danger" 
                onClick={handleDeleteUser}
              >
                Delete User
              </Button>
            )}
                <div
                  className="d-flex justify-content-between align-items-center mb-3"
                  style={{ position: "relative" }}
                >
                  <p className="fs-2 fw-bold text-start mb-0">All Works</p>

                  <div style={{ position: "relative", display: "inline-block" }}>
                    {/* Rendezés gomb */}
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
                          borderRadius: "1rem",
                        }}
                      >
                        {[
                          { label: "Name", value: "name" },
                          { label: "Paid", value: "paid" },
                          { label: "Price", value: "price" },
                          { label: "Status", value: "status" },
                          { label: "Ordered", value: "orderDate" },
                          { label: "Completed", value: "finishDate" },
                        ].map((opt) => (
                          <Button
                            key={opt.value}
                            variant="outline-primary"
                            className="w-100 mb-2"
                            style={{
                              border: "none",
                              color: "black",
                              borderRadius: "1rem",
                            }}
                            onClick={() => sortWorks(opt.value)}
                          >
                            {opt.label}
                          </Button>
                        ))}
                      </div>
                    )}

                    {/* Szűrés gomb */}
                    <Button
                      variant="link"
                      style={{
                        fontSize: "20px",
                        textDecoration: "none",
                        marginLeft: "0.5rem",
                      }}
                      onClick={() => setShowFilterWork(!showFilterWork)}
                    >
                      <IonIcon icon={filterIcon} />
                    </Button>
                    {showFilterWork && (
                      <div
                        style={{
                          position: "absolute",
                          top: "100%",
                          right: 0,
                          backgroundColor: "white",
                          border: "1px solid #ccc",
                          padding: "12px",
                          zIndex: 1100,
                          width: "20vw",
                          borderRadius: "1rem",
                        }}
                      >
                        {workFilterOptions.map((opt) => {
                          if (opt.type === "string") {
                            return (
                              <div key={opt.vkey} style={{ marginBottom: "12px" }}>
                                <div
                                  style={{
                                    marginBottom: "6px",
                                    fontWeight: "bold",
                                  }}
                                >
                                  {opt.label}
                                </div>
                                <input
                                  type="text"
                                  placeholder={opt.label}
                                  value={opt.value}
                                  onChange={(e) =>
                                    startFilter(opt.vkey, "string", "min", e.target.value)
                                  }
                                  style={{
                                    width: "100%",
                                    padding: "6px",
                                    borderRadius: "1rem",
                                    border: "1px solid #ccc",
                                  }}
                                />
                              </div>
                            );
                          }
                          if (opt.type === "interval") {
                            return (
                              <div key={opt.vkey} style={{ marginBottom: "12px" }}>
                                <div
                                  style={{
                                    marginBottom: "6px",
                                    fontWeight: "bold",
                                  }}
                                >
                                  {opt.label}
                                </div>
                                {opt.vkey.toLowerCase().includes("date") ? (
                                  <>
                                    <input
                                      type="date"
                                      value={opt.value.min || ""}
                                      onChange={(e) =>
                                        startFilter(opt.vkey, "interval", "min", e.target.value)
                                      }
                                      style={{
                                        width: "47.5%",
                                        padding: "6px",
                                        borderRadius: "1rem",
                                        border: "1px solid #ccc",
                                        marginRight: "10px",
                                        marginBottom: "8px",
                                      }}
                                    />
                                    <input
                                      type="date"
                                      value={opt.value.max || ""}
                                      onChange={(e) =>
                                        startFilter(opt.vkey, "interval", "max", e.target.value)
                                      }
                                      style={{
                                        width: "47.5%",
                                        padding: "6px",
                                        borderRadius: "1rem",
                                        border: "1px solid #ccc",
                                        marginBottom: "8px",
                                      }}
                                    />
                                  </>
                                ) : (
                                  <>
                                    <input
                                      type="number"
                                      placeholder="Min"
                                      value={opt.value.min || ""}
                                      onChange={(e) =>
                                        startFilter(opt.vkey, "interval", "min", e.target.value)
                                      }
                                      style={{
                                        width: "47.5%",
                                        padding: "6px",
                                        borderRadius: "1rem",
                                        border: "1px solid #ccc",
                                        marginRight: "10px",
                                        marginBottom: "8px",
                                      }}
                                    />
                                    <input
                                      type="number"
                                      placeholder="Max"
                                      value={opt.value.max || ""}
                                      onChange={(e) =>
                                        startFilter(opt.vkey, "interval", "max", e.target.value)
                                      }
                                      style={{
                                        width: "47.5%",
                                        padding: "6px",
                                        borderRadius: "1rem",
                                        border: "1px solid #ccc",
                                        marginBottom: "8px",
                                      }}
                                    />
                                  </>
                                )}
                              </div>
                            );
                          }
                          if (opt.type === "valueList") {
                            return (
                              <div key={opt.vkey}>
                                <div
                                  style={{
                                    marginBottom: "6px",
                                    fontWeight: "bold",
                                    cursor: "pointer",
                                  }}
                                  onClick={handleToggleVisibility}
                                >
                                  {opt.label}
                                </div>
                                {visibleFilter && (
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
                                      width: "8rem",
                                    }}
                                  >
                                    {opt.values.map((status) => (
                                      <div
                                        key={status}
                                        style={{
                                          height: "2.5rem",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "space-between",
                                          cursor: "pointer",
                                        }}
                                        onClick={() =>
                                          startFilter(opt.vkey, "valueList", null, status)
                                        }
                                      >
                                        <p style={{ margin: 0 }}>{status}</p>
                                        <IonIcon
                                          icon={
                                            opt.value.includes(status)
                                              ? "radio-button-on"
                                              : "radio-button-off-outline"
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

                <div
                  style={{
                    flex: 1,
                    overflowY: "auto",
                    border: "1px solid #dee2e6",
                    borderRadius: "0.25rem",
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
                        zIndex: 10,
                      }}
                    >
                      <tr>
                        <th style={{ padding: "10px", textAlign: "left" }}>
                          Id
                        </th>
                        <th style={{ padding: "10px", textAlign: "left" }}>
                          Paid
                        </th>
                        <th style={{ padding: "10px", textAlign: "left" }}>
                          Price
                        </th>
                        <th style={{ padding: "10px", textAlign: "left" }}>
                          Label
                        </th>
                        <th style={{ padding: "10px", textAlign: "left" }}>
                          Status
                        </th>
                        <th style={{ padding: "10px", textAlign: "left" }}>
                          Ordered
                        </th>
                        <th style={{ padding: "10px", textAlign: "left" }}>
                          Completed
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {workList.length === 0 ? (
                        <tr>
                          <td
                            colSpan="7"
                            style={{ textAlign: "center", padding: "10px" }}
                          >
                            No works found.
                          </td>
                        </tr>
                      ) : (
                        workList.map((work) => (
                          <tr
                            key={work.workId}
                            onClick={() => handleRowClick(work.workId)}
                            style={{
                              cursor: "pointer",
                              borderBottom: "thin solid #dee2e6",
                            }}
                          >
                            <td style={{ padding: "10px", textAlign: "left" }}>
                              {work.workId || "N/A"}
                            </td>
                            <td style={{ padding: "10px", textAlign: "left" }}>
                              {work.paid != null ? work.paid : 0}
                            </td>
                            <td style={{ padding: "10px", textAlign: "left" }}>
                              {work.price != null ? work.price : 0}
                            </td>
                            <td style={{ padding: "10px", textAlign: "left" }}>
                              {work.label || "N/A"}
                            </td>
                            <td style={{ padding: "10px", textAlign: "left" }}>
                              {work.status || "N/A"}
                            </td>
                            <td style={{ padding: "10px", textAlign: "left" }}>
                              {work.orderDate
                                ? new Date(work.orderDate).toLocaleDateString("hu-HU")
                                : "N/A"}
                            </td>
                            <td style={{ padding: "10px", textAlign: "left" }}>
                              {work.finishDate
                                ? new Date(work.finishDate).toLocaleDateString("hu-HU")
                                : "N/A"}
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
                  error="User not found"
                  onClose={handleCloseErrorModal}
                />
                <Button variant="primary" onClick={() => navigate("/dashboard")}>
                  Back to Dashboard
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default UserAnalyzer;
