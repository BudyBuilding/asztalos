import { useState } from "react";
import Table from "react-bootstrap/Table";
import ListGroup from "react-bootstrap/ListGroup";
import Button from "react-bootstrap/Button"; // Importáljuk be a Button komponenst
import DashboardListItem from "../reusable/dashboard-list-item";

function Dashboard() {
  const [tasks, setTasks] = useState([
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

  return (
    <>
      <div class="container d-xl-block">
        <p className="fs-1 fw-bold text-start">Dashboard</p>
      </div>

      <div class="container d-xl-block">
        <p className="fs-2 fw-bold text-start">Recent works</p>
        <div className="d-flex justify-content-between mb-2">
          {/* Gombok hozzáadása a rendezéshez */}
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
          {tasks.map((work) => (
            <DashboardListItem key={work.id} work={work} />
          ))}
        </ListGroup>
      </div>
    </>
  );
}

export default Dashboard;
