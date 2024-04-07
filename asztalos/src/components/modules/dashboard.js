import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ListGroup from "react-bootstrap/ListGroup";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import DashboardListItem from "../reusable/dashboardListItem";
import { getClients, getWorks } from "../data/firebase/apiService";

function Dashboard() {
  const works = useSelector((state) => state.works);
  const clients = useSelector((state) => state.clients);

  return (
    <>
      <Container className="container d-xl-block">
        <div className="d-flex justify-content-between align-items-center">
          <p className="fs-1 fw-bold text-start mb-0">Dashboard</p>
          <div>
            <Button variant="primary" onClick={() => {}} className="me-3">
              New work
            </Button>
            <Button variant="primary" onClick={() => {}} className="me-3">
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
  );
}

export default Dashboard;
