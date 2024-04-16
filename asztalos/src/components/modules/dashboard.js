import { useState, useEffect } from "react";
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
function Dashboard({ onSelectClient }) {
  const [works, setWorks] = useState(useSelector((state) => state.works));
  const clients = useSelector((state) => state.clients);
  const [showNewClient, setShowNewClient] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate(); // használjuk a navigate hookot közvetlenül

  const handleSelectClient = (clientId) => {
    dispatch(selectClient(clientId));
    console.log({ clientId });

    navigate(`/clientAnalyzer/${clientId}`);
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

      <Container className="container d-xl-block">
        <div className="d-flex justify-content-between align-items-center">
          <p className="fs-1 fw-bold text-start mb-0">Dashboard</p>
          <div>
            <Button variant="primary" onClick={() => {}} className="me-3">
              New work
            </Button>
            <Button
              variant="primary"
              onClick={handleNewClientClick}
              className="me-3"
            >
              New client
            </Button>
          </div>
        </div>
      </Container>

      <Container className="d-xl-block">
        <p className="fs-2 fw-bold text-start">Clients</p>
        <div className="d-flex flex-nowrap overflow-x-scroll">
          {clients.map((client) => (
            <div
              key={client.ClientId}
              className="p-3 border rounded"
              style={{ minWidth: "200px", margin: "10px" }}
              onClick={() => handleSelectClient(client.ClientId)}
            >
              <p className="fw-bold">{client.Name}</p>
              <p>Tel: {client.Tel}</p>
              <p>Address: {client.Address}</p>
            </div>
          ))}
        </div>
      </Container>

      <div className="container d-xl-block">
        <p className="fs-2 fw-bold text-start">Recent works</p>
        <div className="d-flex justify-content-between mb-2">
          <Button variant="primary" onClick={() => requestSort("Client")}>
            Client
          </Button>
          <Button variant="primary" onClick={() => requestSort("Date")}>
            Date
          </Button>
          <Button variant="primary" onClick={() => requestSort("Status")}>
            Status
          </Button>
          <Button variant="primary" onClick={() => requestSort("Price")}>
            Price
          </Button>
          <Button variant="primary" onClick={() => requestSort("Paid")}>
            Paid
          </Button>
        </div>
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
