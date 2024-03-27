import { useState } from "react";
import Table from "react-bootstrap/Table";
import ListGroup from "react-bootstrap/ListGroup";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import DashboardListItem from "../reusable/dashboard-list-item";
import Carousel from "react-bootstrap/Carousel";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

function Dashboard() {
  const [works, setWorks] = useState([
    {
      Id: 1,
      Client: "Chereji Clau",
      Date: new Date("2024-03-30"),
      Status: "Completed",
      Price: 2024,
      Paid: 1500,
    },
    {
      Id: 2,
      Client: "Irina geta",
      Date: new Date("2024-04-05"),
      Status: "In Progress",
      Price: 2024,
      Paid: 1500,
    },
    {
      Id: 3,
      Client: "Aronia",
      Date: new Date("2024-04-10"),
      Status: "Pending",
      Price: 2024,
      Paid: 1500,
    },
  ]);
  const clientBoxWidth = 200;

  const [clients, setClients] = useState([
    {
      Id: 1,
      Name: "Johhnysdasd Depp",
      Tel: "+40758612749",
      Address: "Satu Mare, street and house number",
    },
    {
      Id: 1,
      Name: "Johhny Depp",
      Tel: "+40758612749",
      Address: "Satu Mare, street and house number",
    },
    {
      Id: 1,
      Name: "Johhny Depp",
      Tel: "+40758612749",
      Address: "Satu Mare, street and house number",
    },
    {
      Id: 1,
      Name: "Johhny Depp",
      Tel: "+40758612749",
      Address: "Satu Mare, street and house number",
    },
    {
      Id: 1,
      Name: "Johhny Depp",
      Tel: "+40758612749",
      Address: "Satu Mare, street and house number",
    },
    {
      Id: 1,
      Name: "Johhny Depp",
      Tel: "+40758612749",
      Address: "Satu Mare, street and house number",
    },
    {
      Id: 1,
      Name: "Johhny Depp",
      Tel: "+40758612749",
      Address: "Satu Mare, street and house number",
    },
    {
      Id: 1,
      Name: "Johhny Depp",
      Tel: "+40758612749",
      Address: "Satu Mare, street and house number",
    },
    {
      Id: 1,
      Name: "Johhny Depp",
      Tel: "+40758612749",
      Address: "Satu Mare, street and house number",
    },
    {
      Id: 1,
      Name: "Johhny Depp",
      Tel: "+40758612749",
      Address: "Satu Mare, street and house number",
    },
    {
      Id: 1,
      Name: "Johhny Depp",
      Tel: "+40758612749",
      Address: "Satu Mare, street and house number",
    },
    {
      Id: 1,
      Name: "Johhny Depp",
      Tel: "+40758612749",
      Address: "Satu Mare, street and house number",
    },
    {
      Id: 1,
      Name: "Johhny Depp",
      Tel: "+40758612749",
      Address: "Satu Mare, street and house number",
    },
    {
      Id: 1,
      Name: "Johhny Depp",
      Tel: "+40758612749",
      Address: "Satu Mare, street and house number",
    },
    {
      Id: 1,
      Name: "Johhny Depp",
      Tel: "+40758612749",
      Address: "Satu Mare, street and house number",
    },
    {
      Id: 1,
      Name: "Johhny Depp",
      Tel: "+40758612749",
      Address: "Satu Mare, street and house number",
    },
    {
      Id: 1,
      Name: "Johhny Depp",
      Tel: "+40758612749",
      Address: "Satu Mare, street and house number",
    },
  ]);

  return (
    <>
      <div class="container d-xl-block">
        <p className="fs-1 fw-bold text-start">Dashboard</p>
      </div>

      <Container className="d-xl-block">
        <p className="fs-2 fw-bold text-start">Clients</p>
        <div className="d-flex flex-nowrap overflow-x-scroll">
          {clients.map((client) => (
            <div
              key={client.Id}
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

      <div class="container d-xl-block">
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
            <DashboardListItem key={work.Id} work={work} />
          ))}
        </ListGroup>
      </div>
    </>
  );
}

export default Dashboard;
