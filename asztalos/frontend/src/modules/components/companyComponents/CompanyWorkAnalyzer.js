import React, { useState, useEffect } from "react";
import { Button, Table, Row, Col, Modal, Form } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getWorkById, getCreatedTablesByWork } from "../../../data/getters";
import { updateWorkApi } from "../../../data/api/workApi";
import Loading from "../../helpers/Loading";

function CompanyWorkAnalyzer() {
  const [selectedWork, setSelectedWork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState(null);
  const [woodsPrice, setWoodsPrice] = useState(0);

  // „Update Work” modal mezői
  const [showModal, setShowModal] = useState(false);
  const [priceInput, setPriceInput] = useState(0);
  const [paidInput, setPaidInput] = useState(0);
  const [labelInput, setLabelInput] = useState("");
  const [woodPriceInput, setWoodPriceInput] = useState(0);
  const [statusInput, setStatusInput] = useState("");

  // „Work Details” collapsible állapota
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isHover, setIsHover] = useState(false);

  // „Confirm Order” modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { workId } = useParams();

  // A store‐ból érkező „createdTables” lista
  const allCreatedTables = useSelector((state) => state.createdTables || []);             
  const createdTables = allCreatedTables.filter(t => t.work.workId == workId);          
  // Munkaadatok betöltése
  useEffect(() => {
    const loadWorkData = async () => {
      setLoading(true);
      try {
        const work = await dispatch(getWorkById(workId));

        const filtered = Array.isArray(work)
          ? work.filter((p) => p.isOrdered === true)
          : null;

        const actualWork = Array.isArray(work)
          ? filtered?.[0] ?? null
          : work;
        console.log("actualWork: ", actualWork);
        setSelectedWork(actualWork);
        setSelectedClient(actualWork?.user || null);

        // Inicializáljuk a modal mezőit
        setPriceInput(actualWork?.companyPrice || 0);
        setPaidInput(actualWork?.userPaid || 0);
        setLabelInput(actualWork?.companyLabel || "");
        setWoodPriceInput(actualWork?.companyWoodPrice || 0);
        setStatusInput(actualWork?.companyStatus || "");
      } catch (error) {
        console.error("Error fetching work:", error);
      } finally {
        setLoading(false);
      }
    };

    loadWorkData();
  }, [dispatch, workId]);

  // Táblázatok betöltése a store-ba
  useEffect(() => {
    const loadTables = async () => {
      try {
        await dispatch(getCreatedTablesByWork(workId));
      } catch (error) {
        console.error("Error fetching created tables:", error);
      }
    };
    loadTables();
  }, [dispatch, workId]);

  // Konzolra íratjuk a createdTables-t, ha változik
  useEffect(() => {
    console.log("createdTables:", createdTables);
    if (createdTables.length > 0) {
      const priceSum = createdTables.reduce((sum, table) => sum + table.price, 0);
      setWoodsPrice(priceSum);
    } else {
      setWoodsPrice(0);
    }
  }, [createdTables]);

  // Táblázatok csoportosítása szín szerint
  const groupedTables = (createdTables || []).reduce((acc, table) => {
    const color = table.color.name;
    if (!acc[color]) {
      acc[color] = {
        color: color,
        quantity: 0,
        totalPrice: 0,
        pricePerQty: table.price,
      };
    }
    acc[color].quantity += 1;
    acc[color].totalPrice += table.price;
    return acc;
  }, {});

  // „Update Work” modal megnyitása és mezők előtöltése
  const handleShowModal = () => {
    // Ha már Completed a státusz, nem engedjük a szerkesztést
    if (selectedWork?.companyStatus === "Completed") {
      setShowModal(true);
      return;
    }
    setPriceInput(selectedWork?.companyPrice || 0);
    setPaidInput(selectedWork?.userPaid || 0);
    setLabelInput(selectedWork?.companyLabel || "");
    setWoodPriceInput(selectedWork?.companyWoodPrice || 0);
    setStatusInput(selectedWork?.companyStatus || "");
    setShowModal(true);
  };
  const handleCloseModal = () => setShowModal(false);

  // „Update Work” mentése
  const handleSave = async () => {
    try {
      const today = new Date().toISOString();
      const payload = {
        companyPrice: priceInput,
        userPaid: paidInput,
        companyLabel: labelInput,
        companyWoodPrice: woodPriceInput,
        companyStatus: statusInput,
        isOrdered: true,
      };
      if (statusInput === "Completed") {
        payload.companyFinishDate = today;
        payload.status = "Active"; 
      }

      await dispatch(updateWorkApi(workId, payload));
      setSelectedWork((prev) => ({
        ...prev,
        companyPrice: priceInput,
        userPaid: paidInput,
        companyLabel: labelInput,
        companyWoodPrice: woodPriceInput,
        companyStatus: statusInput,
        isOrdered: true,  
        ...(statusInput === "Completed"
          ? { companyFinishDate: today }
          : {}),
      }));
      setShowModal(false);
    } catch (error) {
      console.error("Error updating work:", error);
      alert("Hiba történt a munka frissítése során!");
    }
  };

  const handleEditWork = () => {
    navigate(`/editWork/${workId}`);
  };

  const handleShowTables = () => {
    navigate(`/TableViewer/${workId}`);
  };

  const handleTableClick = () => {
    navigate(`/TableViewer/${workId}`);
  };

  // Dátum formázása „hu-HU” formátumba
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("hu-HU");
  };

  // === Mindig látható mezők („Work Details” összesítő) ===
  const alwaysVisibleFields = (
    <>
      {/* 1. sor: Order Status / Order Date */}
      <div style={{ display: "flex", marginBottom: "0.75rem" }}>
        <div style={{ flex: 1, marginRight: "1rem" }}>
          <p className="fs-5 mb-0">
            <strong>Order Status:</strong>{" "}
            {selectedWork?.companyStatus || "Not Ordered"}
          </p>
        </div>
        <div style={{ flex: 1 }}>
          <p className="fs-5 mb-0">
            <strong>Order Date:</strong>{" "}
            {selectedWork?.orderDate
              ? formatDate(selectedWork.orderDate)
              : "—"}
          </p>
        </div>
      </div>

      {/* 2. sor: Total Price / User Paid */}
      <div style={{ display: "flex", marginBottom: "0.75rem" }}>
        <div style={{ flex: 1, marginRight: "1rem" }}>
          <p className="fs-5 mb-0">
            <strong>Total Price:</strong>{" "}
            {selectedWork?.companyPrice
              ? `${selectedWork.companyPrice} RON`
              : "0 RON"}
          </p>
        </div>
        <div style={{ flex: 1 }}>
          <p className="fs-5 mb-0">
            <strong>User Paid:</strong> {selectedWork?.userPaid || 0} RON
          </p>
        </div>
      </div>
    </>
  );

  // === Részletek („Több mutatása”) mezők ===
  const expandedFields = (
    <>
      {/* Company Label / Company Wood Price */}
      <div style={{ display: "flex", marginBottom: "0.75rem" }}>
        <div style={{ flex: 1, marginRight: "1rem" }}>
          <p className="fs-5 mb-0">
            <strong>Company Label:</strong>{" "}
            {selectedWork?.companyLabel || "—"} RON
          </p>
        </div>
        <div style={{ flex: 1 }}>
          <p className="fs-5 mb-0">
            <strong>Wood Price:</strong>{" "}
            {selectedWork?.companyWoodPrice || 0} RON
          </p>
        </div>
      </div>

      {/* User Has to Pay / Completed Date */}
      <div style={{ display: "flex", marginBottom: "0.75rem" }}>
        <div style={{ flex: 1, marginRight: "1rem" }}>
          <p className="fs-5 mb-0">
            <strong>User Has to Pay:</strong>{" "}
            {(selectedWork?.companyPrice || 0) -
              (selectedWork?.userPaid || 0)}{" "}
            RON
          </p>
        </div>
        {selectedWork?.companyStatus === "Completed" && (
          <div style={{ flex: 1 }}>
            <p className="fs-5 mb-0">
              <strong>Completed Date:</strong>{" "}
              {selectedWork.companyFinishDate
                ? formatDate(selectedWork.companyFinishDate)
                : "—"}
            </p>
          </div>
        )}
      </div>
    </>
  );

  return (
    <div>
      {/* =======================
          „Update Work” modal
      ======================= */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Update Work #{workId}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedWork?.companyStatus === "Completed" ? (
            <p className="text-danger">
              Ez a munka már kész, nem lehet módosítani.
            </p>
          ) : (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Price</Form.Label>
                <Form.Control
                  type="number"
                  value={priceInput}
                  onChange={(e) => setPriceInput(+e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Paid</Form.Label>
                <Form.Control
                  type="number"
                  value={paidInput}
                  onChange={(e) => setPaidInput(+e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Label</Form.Label>
                <Form.Control
                  type="text"
                  value={labelInput}
                  onChange={(e) => setLabelInput(e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Wood Price</Form.Label>
                <Form.Control
                  type="number"
                  value={woodPriceInput}
                  onChange={(e) => setWoodPriceInput(+e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={statusInput}
                  onChange={(e) => setStatusInput(e.target.value)}
                >
                  <option value={selectedWork?.companyStatus}>
                    {selectedWork?.companyStatus}
                  </option>
                  {selectedWork?.companyStatus === "Pending" && (
                    <option value="Active">Active</option>
                  )}
                  {selectedWork?.companyStatus === "Active" && (
                    <option value="Completed">Completed</option>
                  )}
                </Form.Select>
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={selectedWork?.companyStatus === "Completed"}
          >
            Save
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
                <span className="fs-1 fw-bold me-2">
                  {selectedClient?.name}
                </span>
                <span className="fs-1 fw-bold me-2">| {selectedWork?.workId}</span>
                <span className="fs-5">workId</span>
              </p>
                <div className="button-box">
                {selectedWork.companyStatus === "Completed" ? <>  </> :
                  <Button
                    variant="warning"
                    onClick={handleShowModal}
                    className="me-1"
                  >
                    Update
                  </Button>
                }

                <Button
                  variant="success"
                  onClick={handleShowTables}
                  className="me-1"
                >
                  Show Table
                </Button>
              </div>
            </div>
          </div>

          {/* ===================================
               „Work Details” blokk – collapsible
             =================================== */}
          <div
            className="container d-xl-block"
            style={{ marginTop: "1rem", marginBottom: "1.5rem" }}
          >
            <p className="fs-2 fw-bold mb-3">Work Details</p>
            <div
              className="row"
              style={{
                border: "1px solid #dee2e6",
                padding: "1rem",
                borderRadius: "0.25rem",
              }}
            >
              {/* Mindig látható mezők */}
              {alwaysVisibleFields}

              {/* Ha lenyílik, mutassuk a további részleteket */}
              {isDetailsOpen && expandedFields}

              {/* Lenyitó/bezáró gomb */}
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
                  userSelect: "none",
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
            <p className="fs-3 fw-bold text-start">Wood</p>
            <div className="row">
              <div className="table-responsive">
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Color</th>
                      <th>Quantity</th>
                      <th>Total Price</th>
                      <th>Price Per Quantity</th>
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
                    <h5>Total Wood Price: {woodsPrice} RON</h5>
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

export default CompanyWorkAnalyzer;
