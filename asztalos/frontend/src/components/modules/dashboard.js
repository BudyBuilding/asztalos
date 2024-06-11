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
import { getClients, getWorks, logout } from "../data/firebase/apiService";
import store from "../data/store/store";
function Dashboard({ onSelectClient }) {
  const dispatch = useDispatch();

  // console.log(dispatch(getWorks()));
  const [works, setWorks] = useState([]);
  const [clients, setClients] = useState([]);

  const [showNewClient, setShowNewClient] = useState(false);
  const navigate = useNavigate(); // használjuk a navigate hookot közvetlenül

  useEffect(() => {
    async function fetchData() {
      const worksData = await dispatch(getWorks());
      const clientsData = await dispatch(getClients());
      setWorks(worksData);
      console.log(clientsData);
      setClients(clientsData);
    }
    fetchData();
  }, []);

  store.subscribe(() => {
    // console.log("State changed:", store.getState());
  });

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

  const handleLogout = () => {
    logout();
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
        <div className="d-flex flex-nowrap overflow-x-scroll">
          {clients.map((client) => (
            <div
              key={client.clientId}
              className="p-3 border rounded"
              style={{ minWidth: "200px", margin: "10px" }}
              onClick={() => handleSelectClient(client.ClientId)}
            >
              <p className="fw-bold">{client.name}</p>
              <p>Tel: {client.telephone}</p>
              <p>Address: {client.address}</p>
            </div>
          ))}
        </div>
      </Container>

      <div className="container d-xl-block">
        <p className="fs-2 fw-bold text-start">Recent works</p>
        <ListGroup.Item className="p-0 m-0">
          <div className="d-flex w-100 m-0 p-3 pb-2 justify-content-between">
            <div className="w-100  text-start" style={{ width: "25%" }}>
              <Button variant="primary" onClick={() => requestSort("Client")}>
                Client
              </Button>
            </div>
            <div className="w-100  text-center" style={{ width: "25%" }}>
              <Button variant="primary" onClick={() => requestSort("Date")}>
                Date
              </Button>
            </div>
            <div className="w-100  text-center" style={{ width: "25%" }}>
              <Button variant="primary" onClick={() => requestSort("Status")}>
                Status
              </Button>
            </div>
            <div className="w-100  text-center" style={{ width: "25%" }}>
              <Button variant="primary" onClick={() => requestSort("Price")}>
                Price
              </Button>
            </div>
            <div className="w-100  text-end" style={{ width: "25%" }}>
              <Button variant="primary" onClick={() => requestSort("Paid")}>
                Paid
              </Button>
            </div>
          </div>
        </ListGroup.Item>

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
