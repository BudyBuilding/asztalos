import { useState } from "react";
import ListGroup from "react-bootstrap/ListGroup";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import DashboardListItem from "../reusable/dashboard-list-item";

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

  const [clients, setClients] = useState([
    {
      Id: 1,
      Name: "John Doe",
      Tel: "+40758612749",
      Address: "123 Main Street, New York",
    },
    {
      Id: 2,
      Name: "Alice Smith",
      Tel: "+123456789",
      Address: "456 Park Avenue, Los Angeles",
    },
    {
      Id: 3,
      Name: "Michael Johnson",
      Tel: "+987654321",
      Address: "789 Maple Street, Chicago",
    },
    {
      Id: 4,
      Name: "Emma Davis",
      Tel: "+135792468",
      Address: "246 Elm Street, San Francisco",
    },
    {
      Id: 5,
      Name: "James Wilson",
      Tel: "+246813579",
      Address: "357 Oak Street, Boston",
    },
    {
      Id: 6,
      Name: "Sophia Martinez",
      Tel: "+369258147",
      Address: "258 Pine Street, Seattle",
    },
    {
      Id: 7,
      Name: "Olivia Brown",
      Tel: "+987654321",
      Address: "753 Cedar Street, Miami",
    },
    {
      Id: 8,
      Name: "William Taylor",
      Tel: "+456123789",
      Address: "159 Birch Street, Dallas",
    },
    {
      Id: 9,
      Name: "Emily Johnson",
      Tel: "+321654987",
      Address: "852 Willow Street, Houston",
    },
    {
      Id: 10,
      Name: "Daniel Garcia",
      Tel: "+789654123",
      Address: "369 Maple Street, Atlanta",
    },
    {
      Id: 11,
      Name: "Isabella Lopez",
      Tel: "+159753468",
      Address: "753 Elm Street, Philadelphia",
    },
    {
      Id: 12,
      Name: "Matthew Young",
      Tel: "+753159852",
      Address: "159 Pine Street, Phoenix",
    },
    {
      Id: 13,
      Name: "Ethan Hernandez",
      Tel: "+357159753",
      Address: "357 Oak Street, Las Vegas",
    },
    {
      Id: 14,
      Name: "Sofia Martinez",
      Tel: "+258963147",
      Address: "258 Cedar Street, San Diego",
    },
    {
      Id: 15,
      Name: "Mia Rodriguez",
      Tel: "+654321987",
      Address: "987 Maple Street, Washington D.C.",
    },
    {
      Id: 16,
      Name: "Alexander Wilson",
      Tel: "+951753852",
      Address: "753 Oak Street, San Antonio",
    },
    {
      Id: 17,
      Name: "Charlotte Gonzalez",
      Tel: "+741852963",
      Address: "147 Pine Street, Denver",
    },
    {
      Id: 18,
      Name: "Jacob Perez",
      Tel: "+369258147",
      Address: "258 Elm Street, Orlando",
    },
    {
      Id: 19,
      Name: "Ava Carter",
      Tel: "+852369741",
      Address: "369 Cedar Street, Nashville",
    },
    {
      Id: 20,
      Name: "Liam Scott",
      Tel: "+123987456",
      Address: "456 Birch Street, Austin",
    },
    // További kliensek...
  ]);

  return (
    <>
      <div class="container d-xl-block">
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
