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

function Dashboard() {
  const works = useSelector((state) => state.works);
  const clients = useSelector((state) => state.clients);
  const [showNewClient, setShowNewClient] = useState(false); // állapot a NewClient komponens megjelenítéséhez
  const dispatch = useDispatch();
  const selectedClientId = useSelector((state) => state.selectedClient); // Hozzáadva
  const [isClientAnalyzerVisible, setIsClientAnalyzerVisible] = useState(false); // Lokális állapot a ClientAnalyzer láthatóságához
  const [isAddingWork, setIsAddingWork] = useState(false); // Lokális állapot az új munka hozzáadásához

  useEffect(() => {
    if (selectedClientId) {
      setIsClientAnalyzerVisible(true);
    }
  }, [selectedClientId]);

  const handleNewClientClick = () => {
    setShowNewClient(true);
  };

  const handleNewClientClose = () => {
    setShowNewClient(false);
  };

  const handleClientClick = (client) => {
    dispatch(selectClient(client.ClientId));
    setIsClientAnalyzerVisible(true);
    //   navigate(`/client/${client.ClientId}`); // URL módosítása a kiválasztott ügyfélre
  };

  const handleCloseClientAnalyzer = () => {
    setIsClientAnalyzerVisible(false);
  };

  return (
    <>
      {isClientAnalyzerVisible || isAddingWork ? (
        <>
          {isClientAnalyzerVisible && (
            <ClientAnalyzer
              client={selectedClientId}
              onClose={handleCloseClientAnalyzer}
            />
          )}

          {/*isAddingWork && (
            <AddNewWork onClose={() => setIsAddingWork(false)} /> // Implementálásra került
          )*/}
        </>
      ) : (
        <>
          {/* Bootstrap Modal for NewClient */}
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
                  onClick={() => handleClientClick(client)}
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
              <Button variant="primary" onClick={() => {}}>
                Client
              </Button>
              <Button variant="primary" onClick={() => {}}>
                Date
              </Button>
              <Button variant="primary" onClick={() => {}}>
                Status
              </Button>
              <Button variant="primary" onClick={() => {}}>
                Price
              </Button>
              <Button variant="primary" onClick={() => {}}>
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
      )}
    </>
  );
}

export default Dashboard;
