import React, { useState, useEffect, useMemo } from "react";
import { Button, Table, Row, Col, Modal, Form } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  getWorkById,
  getCreatedTablesByWork,
  getCreatedItemsByWork,
  getAllCreatedItems,
  getAllColors
} from "../../data/getters";
import Loading from "../helpers/Loading";
import { updateWorkApi } from "../../data/api/workApi";

function WorkAnalyzer() {
  const [selectedWork, setSelectedWork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState(null);

  // „Update Work” modal mezői
  const [showModal, setShowModal] = useState(false);
  const [priceInput, setPriceInput] = useState(0);
  const [paidInput, setPaidInput] = useState(0);
  const [labelInput, setLabelInput] = useState(0);
  const [statusInput, setStatusInput] = useState(0); // itt a „Completed” vagy „Cancelled” egyikét fogjuk tartani
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [woodPriceInput, setWoodPriceInput] = useState(0);
  // Hover állapot a lenyitó gombhoz
  const [isHover, setIsHover] = useState(false);

  // Rendelés megerősítő modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // const [allCreatedItems, setAllCreatedItems] = useState([]);
  // const [createdItems, setCreatedItems] = useState([]);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { workId } = useParams();
  const allCreatedItems = useSelector((state) => state.createdItems);
  const createdItems = useMemo(() => {
    return allCreatedItems.filter((item) => item.work.workId === +workId);
  }, [allCreatedItems, workId]);

  // A store‐ból érkező „createdTables” lista
  const allTablesRaw = useSelector((state) => state.createdTables || []);
  const colors = useSelector((state) => state.colors || []);
  useEffect(() => {
    console.log("🔍 allTablesRaw:", allTablesRaw);
  }, [allTablesRaw]);
  // 1) csak az adott munkához tartozók
  const tablesForThisWork = useMemo(
    () => allTablesRaw.filter((t) => t.work.workId == workId),
    [allTablesRaw, workId]
  );
  useEffect(() => {
    console.log("🔍 tablesForThisWork:", tablesForThisWork);
  }, [tablesForThisWork]);
  // 2) minden táblához „kigyűjtjük” a teljes szín‐objektumot a colors listából
  const createdTables = useMemo(
    () =>
      tablesForThisWork.map((t) => {
        const fullColor = colors.find((c) => c.colorId === t.color.colorId) || {
          colorId: t.color.colorId,
          name: "Ismeretlen",
          hex: "#ccc"
        };
        return { ...t, color: fullColor };
      }),
    [tablesForThisWork, colors]
  );
  const fallbackTotal = useMemo(
    () => createdTables.reduce((sum, t) => sum + t.price, 0),
    [createdTables]
  );
  const totalPrice =
    (selectedWork?.clientPrice ?? 0) > 0
      ? selectedWork.clientPrice
      : fallbackTotal + (selectedWork?.label ?? 0);

  // totalWoodPrice: ha van woodPrice (>0), azt mutatjuk, különben csak a createdTables összege
  const totalWoodPrice =
    (selectedWork?.woodPrice ?? 0) > 0 ? selectedWork.woodPrice : fallbackTotal;
  // Betöltjük a work és kliens adatokat

  useEffect(() => {
    const loadAllWorkData = async () => {
      setLoading(true);
      try {
        const work = await dispatch(getWorkById(workId));
        setSelectedWork(work);
        setSelectedClient(work.client);
        setStatusInput(work.status);

        // Várjuk meg a táblák és itemek betöltését is
        await Promise.all([
          dispatch(getCreatedTablesByWork(workId))
          //   dispatch(getAllCreatedItems()) // vagy fetchCreatedItemsForWork(workId), ha az a jó
        ]);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAllWorkData();
  }, [dispatch, workId]);

  useEffect(() => {
    const loadTables = async () => {
      try {
        await dispatch(getCreatedTablesByWork(workId));
      } catch (error) {
        console.error(
          "Error fetching created tables:",
          error,
          error.response?.status,
          error.response?.data
        );
      }
    };
    loadTables();
  }, [dispatch, workId]);

  // Táblázatok csoportosítása szín szerint
  const groupedTables = useMemo(() => {
    return createdTables.reduce((acc, table) => {
      const color = table.color.name;
      if (!acc[color])
        acc[color] = { color, quantity: 0, totalPrice: 0, pricePerQty: 0 };
      acc[color].quantity += 1;
      acc[color].totalPrice += table.price;
      if (!acc[color].pricePerQty && table.price > 0) {
        acc[color].pricePerQty = table.price;
      }
      return acc;
    }, {});
  }, [createdTables]);

  // „Update Work” modal megnyitása: előtöltjük a mezőket
  const handleShowModal = () => {
    if (!selectedWork) return;
    // initial price: clientPrice vagy fallback+label
    const cp = selectedWork.clientPrice ?? 0;
    const fallback = fallbackTotal + (selectedWork.label ?? 0);
    setPriceInput(cp > 0 ? cp : fallback);
    setPaidInput(selectedWork.clientPaid || 0);
    setLabelInput(selectedWork.label || 0);
    setStatusInput(selectedWork.status);
    // initial wood price
    const wp = selectedWork.woodPrice ?? 0;
    setWoodPriceInput(wp > 0 ? wp : fallbackTotal);
    setShowModal(true);
  };
  const handleCloseModal = () => setShowModal(false);

  // „Update Work” mentése, figyeljük a „Completed” vagy „Cancelled” állapotot
  const handleSave = async () => {
    if (!selectedWork) {
      handleCloseModal();
      return;
    }
    const today = new Date().toISOString();
    const payload = {
      clientPrice: priceInput,
      clientPaid: paidInput,
      label: labelInput,
      woodPrice: woodPriceInput,
      status: statusInput
    };
    if (statusInput === "Completed") {
      payload.finishDate = today;
      payload.status = "completed";
    }
    if (statusInput === "Cancelled") {
      payload.cancelDate = today;
      payload.status = "Cancelled";
    }
    await dispatch(updateWorkApi(workId, payload));
    setSelectedWork((prev) => ({
      ...prev,
      clientPrice: priceInput,
      clientPaid: paidInput,
      label: labelInput,
      woodPrice: woodPriceInput,
      status: statusInput,
      ...(statusInput === "Completed" && { finishDate: today }),
      ...(statusInput === "Cancelled" && { cancelDate: today })
    }));
    handleCloseModal();
  };

  // Szerkesztésre és táblamegjelenítésre navigálás
  const handleEditWork = () => {
    navigate(`/editWork/${workId}`);
  };
  const handleShowTables = () => {
    navigate(`/TableViewer/${workId}`);
  };

  // „Order Now” gomb: először ellenőrizzük, hogy van‐e legalább egy createdTable
  const handleOrderSelectedWork = () => {
    if (!selectedWork) return;
    if (!Array.isArray(createdTables) || createdTables.length === 0) {
      alert(
        "Nincsenek elkészített táblák – előbb hozz létre legalább egy createdTable‐t."
      );
      return;
    }

    if (!Array.isArray(createdItems) || createdItems.length === 0) {
      alert(
        "Nincsenek elkészített elemek – előbb hozz létre legalább egy elemet."
      );
      return;
    }

    const unassigned = createdItems.filter(
      (ci) => ci.tablePosition == null || ci.tablePosition == ""
    );
    console.log("createdItems: ", createdItems);
    console.log("unassigned: ", unassigned);
    if (unassigned.length > 0) {
      alert(
        `Még nincs hozzárendelve ${unassigned.length} tétel táblához. Kérlek, előbb számold újra a táblákat!`
      );
      return;
    }

    setShowConfirmModal(true);
  };

  // Ha a felhasználó megerősíti a rendelést
  const handleConfirmOrder = async () => {
    if (!selectedWork) {
      setShowConfirmModal(false);
      return;
    }
    const today = new Date().toISOString();
    await dispatch(
      updateWorkApi(workId, {
        isOrdered: true,
        orderDate: today,
        status: "Ordered",
        companyStatus: "Pending"
      })
    );
    setSelectedWork((prev) => ({
      ...prev,
      isOrdered: true,
      orderDate: today,
      status: "Ordered",
      companyStatus: "Pending"
    }));
    setShowConfirmModal(false);
  };
  const handleCancelOrder = () => {
    setShowConfirmModal(false);
  };

  // Dátum formázása „hu-HU” formátumba
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("hu-HU");
  };

  // Mindig látható „összesítő” mezők
  const alwaysVisibleFields = (
    <>
      {/* 1. Sor: Work Status / Order Status */}
      <div style={{ display: "flex", marginBottom: "0.75rem" }}>
        <div style={{ flex: 1, marginRight: "1rem" }}>
          <p className="fs-5 mb-0">
            <strong>Munka állapota:</strong>{" "}
            {selectedWork?.status
              ? {
                  MEASURED: "Felmért",
                  PENDING: "Függőben",
                  ORDERED: "Rendelve",
                  ACTIVE: "Aktív",
                  COMPLETED: "Teljesítve",
                  CANCELLED: "Törölve"
                }[selectedWork.status.toUpperCase()] ?? selectedWork.status
              : ""}
          </p>
        </div>
        <div style={{ flex: 1 }}>
          <p className="fs-5 mb-0">
            <strong>Rendelés állapota:</strong>{" "}
            {selectedWork?.companyStatus
              ? {
                  MEASURED: "Felmért",
                  PENDING: "Függőben",
                  ORDERED: "Rendelve",
                  ACTIVE: "Aktív",
                  COMPLETED: "Teljesítve",
                  CANCELLED: "Törölve"
                }[selectedWork?.companyStatus.toUpperCase()] ??
                selectedWork?.companyStatus
              : "Nincs lerendelve"}
          </p>
        </div>
      </div>

      {/* 2. Sor: Total Price / Order Price */}
      <div style={{ display: "flex", marginBottom: "0.75rem" }}>
        <div style={{ flex: 1, marginRight: "1rem" }}>
          <p className="fs-5 mb-0">
            <strong>Teljes ár:</strong> {totalPrice} RON
          </p>
        </div>
        <div style={{ flex: 1 }}>
          <p className="fs-5 mb-0">
            <strong>Rendelés összege:</strong> {selectedWork?.companyPrice || 0}{" "}
            RON
          </p>
        </div>
      </div>
    </>
  );

  // Részletek (lenyíló) mezők
  const expandedFields = (
    <>
      {/* Client Paid / User Paid */}
      <div style={{ display: "flex", marginBottom: "0.75rem" }}>
        <div style={{ flex: 1, marginRight: "1rem" }}>
          <p className="fs-5 mb-0">
            <strong>Kliens fizetett:</strong> {selectedWork?.clientPaid || 0}{" "}
            RON
          </p>
        </div>
        <div style={{ flex: 1 }}>
          <p className="fs-5 mb-0">
            <strong>Felhasználó fizetett:</strong> {selectedWork?.userPaid || 0}{" "}
            RON
          </p>
        </div>
      </div>

      {/* Client Has to Pay / User Has to Pay */}
      <div style={{ display: "flex", marginBottom: "0.75rem" }}>
        <div style={{ flex: 1, marginRight: "1rem" }}>
          <p className="fs-5 mb-0">
            <strong>Kliens kell még fizessen:</strong>{" "}
            {(+selectedWork?.clientPrice ?? 0) -
              (+selectedWork?.clientPaid ?? 0)}{" "}
            RON
          </p>
        </div>
        <div style={{ flex: 1 }}>
          <p className="fs-5 mb-0">
            <strong>Felhasználó kell még fizessen:</strong>{" "}
            {selectedWork?.companyPrice - selectedWork?.userPaid || 0} RON
          </p>
        </div>
      </div>

      {/* Wood Price / Company Wood Price */}
      <div style={{ display: "flex", marginBottom: "0.75rem" }}>
        <div style={{ flex: 1, marginRight: "1rem" }}>
          <p className="fs-5 mb-0">
            <strong>Anyagár:</strong>{" "}
            {(selectedWork?.woodPrice ?? 0) > 0
              ? selectedWork.woodPrice
              : totalWoodPrice}{" "}
            RON
          </p>
        </div>
        <div style={{ flex: 1 }}>
          <p className="fs-5 mb-0">
            <strong>Lapszabászat anyagár:</strong>{" "}
            {selectedWork?.companyWoodPrice} RON
          </p>
        </div>
      </div>

      {/* Label / Company Label */}
      <div style={{ display: "flex", marginBottom: "0.75rem" }}>
        <div style={{ flex: 1, marginRight: "1rem" }}>
          <p className="fs-5 mb-0">
            <strong>Asztalos munkadíj:</strong> {selectedWork?.label} RON
          </p>
        </div>
        <div style={{ flex: 1 }}>
          <p className="fs-5 mb-0">
            <strong>Lapszabászat munkadíj:</strong> {selectedWork?.companyLabel}{" "}
            RON
          </p>
        </div>
      </div>

      {/* Measured Date / Order Date / Completed Date */}
      <div style={{ display: "flex", marginBottom: "0.75rem" }}>
        <div style={{ flex: 1, marginRight: "1rem" }}>
          <p className="fs-5 mb-0">
            <strong>Felmérés dátuma:</strong>{" "}
            {selectedWork?.measureDate
              ? formatDate(selectedWork.measureDate)
              : "—"}
          </p>
        </div>
        <div style={{ flex: 1 }}>
          <p className="fs-5 mb-0">
            <strong>Rendelés dátuma:</strong>{" "}
            {selectedWork?.orderDate ? formatDate(selectedWork.orderDate) : "—"}
          </p>
        </div>
      </div>
      {selectedWork?.status === "completed" && (
        <div style={{ marginBottom: "0.75rem" }}>
          <p className="fs-5 mb-0">
            <strong>Befejezés dátuma:</strong>{" "}
            {selectedWork?.finishDate
              ? formatDate(selectedWork.finishDate)
              : "—"}
          </p>
        </div>
      )}
      {selectedWork?.status === "cancelled" && (
        <div style={{ marginBottom: "0.75rem" }}>
          <p className="fs-5 mb-0">
            <strong>Törlés dátuma:</strong>{" "}
            {selectedWork?.cancelDate
              ? formatDate(selectedWork.cancelDate)
              : "—"}
          </p>
        </div>
      )}
    </>
  );

  return (
    <div>
      {/* =======================
          „Update Work” modal
      ======================= */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>#{workId} munka frissítése</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Row className="align-items-center">
                <Col>
                  <Form.Label className="mb-0">Ár</Form.Label>
                </Col>
                <Col className="text-end">
                  <Form.Text className="text-muted mb-0">
                    Lapszabászat ár: {selectedWork?.companyPrice ?? "—"} RON
                  </Form.Text>
                </Col>
              </Row>
              <Form.Control
                type="number"
                value={priceInput}
                onChange={(e) => setPriceInput(+e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Row className="align-items-center">
                <Col>
                  <Form.Label className="mb-0">Kliens fizetett</Form.Label>
                </Col>
                <Col className="text-end">
                  <Form.Text className="text-muted mb-0">
                    Asztalos fizetett: {selectedWork?.userPaid ?? "—"} RON
                  </Form.Text>
                </Col>
              </Row>
              <Form.Control
                type="number"
                value={paidInput}
                onChange={(e) => setPaidInput(+e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Row className="align-items-center">
                <Col>
                  <Form.Label className="mb-0">Munkadíj</Form.Label>
                </Col>
                <Col className="text-end">
                  <Form.Text className="text-muted mb-0">
                    Lapszabászat munkadíj: {selectedWork?.companyLabel ?? "—"}{" "}
                    RON
                  </Form.Text>
                </Col>
              </Row>
              <Form.Control
                type="text"
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Row className="align-items-center">
                <Col>
                  <Form.Label className="mb-0">Anyagár</Form.Label>
                </Col>
                <Col className="text-end">
                  <Form.Text className="text-muted mb-0">
                    Lapszabászat anyagár:{" "}
                    {selectedWork?.companyWoodPrice ?? "—"} RON
                  </Form.Text>
                </Col>
              </Row>
              <Form.Control
                type="number"
                value={woodPriceInput}
                onChange={(e) => setWoodPriceInput(+e.target.value)}
              />
            </Form.Group>

            {/* Ezek után jön a státusz‐dropdown: csak „Completed” és „Cancelled” */}
            {selectedWork?.isOrdered === true &&
            selectedWork?.companyStatus !== "Completed" ? (
              <></>
            ) : (
              <Form.Group className="mb-3">
                <Form.Label>Állapot</Form.Label>
                <Form.Select
                  value={statusInput}
                  onChange={(e) => setStatusInput(e.target.value)}
                >
                  {selectedWork?.status === "Active" && (
                    <>
                      <option value="Active">Aktív</option>
                      <option value="Completed">Befejezett</option>
                    </>
                  )}
                  {selectedWork?.status === "Measured" && (
                    <>
                      <option value="Measured">Felmért</option>
                      <option value="Cancelled">Törölt</option>
                    </>
                  )}
                  {/* Ha szeretnéd, itt lehetne egy mindig elérhető alap opció */}
                </Form.Select>
                <Form.Text
                  className="text-muted"
                  style={{ fontSize: "0.875rem" }}
                >
                  {selectedWork?.status === "Active"
                    ? "A munkát most törölheted."
                    : "A „Befejezett” csak akkor elérhető, ha a státusz már „Aktív”."}
                </Form.Text>
              </Form.Group>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Mégsem
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Mentés
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ==============================
          „Confirm Order” modal
      ============================== */}
      <Modal show={showConfirmModal} onHide={handleCancelOrder}>
        <Modal.Header closeButton>
          <Modal.Title>Rendelés megerősítése</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Biztos, hogy meg szeretnéd rendelni ezt a munkát?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancelOrder}>
            Mégsem
          </Button>
          <Button variant="primary" onClick={handleConfirmOrder}>
            Megerősítés
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ================================
          Ha még töltődik a work, mutassuk a Loading‐et
      ================================ */}
      {loading || !selectedWork ? (
        <Loading />
      ) : (
        <div style={{ height: "100vh" }}>
          {/* ======== Fejléc ======== */}
          <div className="container d-xl-block">
            <div className="d-flex justify-content-between align-items-center">
              <p className="fs-3 text-start mb-0">
                <span className="fs-1 fw-bold me-2">{selectedClient.name}</span>
                <span className="fs-1 fw-bold me-2">
                  | {selectedWork.workId}
                </span>
                <span className="fs-5">azonosító</span>
              </p>
              <div className="button-box">
                {selectedWork.status !== "Completed" &&
                  selectedWork.status !== "Cancelled" && (
                    <Button
                      variant="warning"
                      onClick={handleShowModal}
                      className="me-1"
                    >
                      Frissítés
                    </Button>
                  )}
                <Button
                  variant="success"
                  onClick={handleShowTables}
                  className="me-1"
                >
                  Táblák
                </Button>
                <Button
                  variant="success"
                  onClick={handleEditWork}
                  className="me-1"
                >
                  Szerkesztés
                </Button>
                {!selectedWork.isOrdered && (
                  <Button
                    variant="primary"
                    onClick={handleOrderSelectedWork}
                    className="ms-auto"
                    disabled={selectedWork.isOrdered === true}
                  >
                    Rendelés
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* ===================================
               „Work Details” blokk – összevontan
             =================================== */}
          <div
            className="container d-xl-block"
            style={{ marginTop: "1rem", marginBottom: "1.5rem" }}
          >
            {/* Cím */}
            <p className="fs-2 fw-bold mb-3">Munka részletek</p>

            {/* Keret és padding a „Work Details” mezőkhöz */}
            <div
              className="row"
              style={{
                border: "1px solid #dee2e6",
                padding: "1rem",
                borderRadius: "0.25rem"
              }}
            >
              {/* === Mindig látható négy mező === */}
              {alwaysVisibleFields}

              {/* === Ha lenyílik, még ezeket is mutatjuk === */}
              {isDetailsOpen && expandedFields}

              {/* === Lenyitó / bezáró gomb === */}
              <div
                onClick={() => setIsDetailsOpen((prev) => !prev)}
                onMouseEnter={() => setIsHover(true)}
                onMouseLeave={() => setIsHover(false)}
                style={{
                  width: "100%",
                  textAlign: "center",
                  cursor: "pointer",
                  padding: "0.75rem 0",
                  backgroundColor: isHover ? "#d0d0d0" : "#e9ecef",
                  borderRadius: "0.25rem",
                  fontWeight: 500,
                  border: "1px solid #b0b0b0",
                  userSelect: "none"
                }}
              >
                {isDetailsOpen ? "Kevesebb mutatása" : "Több mutatása"}
              </div>
            </div>
          </div>

          {/* ================================
              „Wood” blokk: csoportosított táblák
            ================================ */}
          <div className="container d-xl-block">
            <p className="fs-3 fw-bold text-start">Alapanyag</p>
            <div className="row">
              <div className="table-responsive">
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Szín</th>
                      <th>Mennyiség</th>
                      <th>Teljes ár</th>
                      <th>Darab ár</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.values(groupedTables).map((group, index) => (
                      <tr key={index}>
                        <td>{group.color}</td>
                        <td>{group.quantity}</td>
                        <td>{group.totalPrice} RON</td>
                        <td>{group.pricePerQty} RON</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                <Row className="justify-content-end">
                  <Col xs="auto">
                    <h5>Teljes alapanyagár: {totalWoodPrice} RON</h5>
                  </Col>
                </Row>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkAnalyzer;
