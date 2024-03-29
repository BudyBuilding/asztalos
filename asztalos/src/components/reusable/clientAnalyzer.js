import React, { useState } from "react";
import { Button, ListGroup } from "react-bootstrap";
import ClientWorkListItem from "./clientWorksListItem";
function ClientAnalyzer() {
  const [works, setWorks] = useState([
    {
      Id: 1,
      Date: new Date("2024-03-30"),
      Status: "Completed",
      Price: 2024,
      Paid: 1500,
    },
    {
      Id: 2,
      Date: new Date("2024-04-05"),
      Status: "In Progress",
      Price: 2024,
      Paid: 1500,
    },
    {
      Id: 3,
      Date: new Date("2024-04-10"),
      Status: "Pending",
      Price: 2024,
      Paid: 1500,
    },
    {
      Id: 4,
      Date: new Date("2024-03-30"),
      Status: "Completed",
      Price: 2024,
      Paid: 1500,
    },
    {
      Id: 5,
      Date: new Date("2024-04-05"),
      Status: "In Progress",
      Price: 2024,
      Paid: 1500,
    },
  ]);

  return (
    <>
      <div class="container d-xl-block">
        <p className="fs-3  text-start d-flex justify-content-between">
          <div>
            <span className="fs-1 fw-bold">Chereju Clau</span>
            &nbsp; works
          </div>
          <div>
            <Button>Edit Client</Button>
          </div>
        </p>
      </div>
      <div class="container d-xl-block">
        <p className="fs-2 fw-bold text-start">Informations</p>
        <div className="row">
          <div className="col-md-6">
            <p className="fs-5 text-start">
              Tel: <span>+40758612749</span>
            </p>
          </div>
          <div className="col-md-6">
            <p className="fs-5 text-start">
              Address: <span>Satu Mare, Str. number</span>
            </p>
          </div>
          <div className="col-md-6">
            <p className="fs-5 text-start">
              All work: <span>5</span>
            </p>
          </div>
          <div className="col-md-6">
            <p className="fs-5 text-start">
              Active work: <span>2</span>
            </p>
          </div>
          <div className="col-md-6">
            <p className="fs-5 text-start">
              Still has to pay: <span>2050</span> RON
            </p>
          </div>
        </div>
      </div>

      <div class="container d-xl-block">
        <div className="d-flex justify-content-between align-items-center">
          <p className="fs-2 fw-bold text-start">Recent works</p>
          <div>
            <Button variant="primary" onClick={() => {}} className="me-3">
              New work
            </Button>
          </div>
        </div>
        <div className="d-flex justify-content-between mb-2">
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
            <ClientWorkListItem key={work.Id} work={work} />
          ))}
        </ListGroup>
      </div>
    </>
  );
}

export default ClientAnalyzer;
