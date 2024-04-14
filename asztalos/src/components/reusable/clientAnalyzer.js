import React, { useState } from "react";
import { Button, ListGroup } from "react-bootstrap";
import ClientWorkListItem from "./clientWorksListItem";
import { useSelector } from "react-redux";

function ClientAnalyzer({ client }) {
  const [works, setWorks] = useState(
    useSelector((state) =>
      state.works.filter((work) => work.ClientId === client)
    )
  );

  const selectedClient = useSelector((state) =>
    state.clients.find((c) => c.ClientId === client)
  );

  const totalWorks = works.length;
  const activeWorks = works.filter(
    (work) => work.Status === "In Progress"
  ).length;
  const stillToPay = works.reduce(
    (acc, work) => acc + (work.Price - work.Paid),
    0
  );
  //
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });
  const requestSort = (key) => {
    let direction = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
    sortWorks(key, direction);
  };

  const sortWorks = (key, order = "asc") => {
    const statusSet = new Set();
    works.forEach((work) => {
      statusSet.add(work.Status);
    });

    const sortedStatusValues = Array.from(statusSet);

    const sortedWorks = [...works].sort((a, b) => {
      if (key === "Status") {
        const aStatus = a.Status === "In Progress" ? "" : a.Status;
        const bStatus = b.Status === "In Progress" ? "" : b.Status;

        if (aStatus === bStatus) {
          return order === "asc" ? a[key] - b[key] : b[key] - a[key];
        }

        const aStatusIndex = sortedStatusValues.indexOf(aStatus);
        const bStatusIndex = sortedStatusValues.indexOf(bStatus);

        return order === "asc"
          ? aStatusIndex - bStatusIndex
          : bStatusIndex - aStatusIndex;
      }

      if (a[key] < b[key]) return order === "asc" ? -1 : 1;
      if (a[key] > b[key]) return order === "asc" ? 1 : -1;
      return 0;
    });

    setWorks(sortedWorks);
  };

  return (
    <>
      <div className="container d-xl-block">
        <p className="fs-3  text-start d-flex justify-content-between">
          <div>
            <span className="fs-1 fw-bold">{selectedClient?.Name}</span>
            &nbsp; works
          </div>
          <div>
            <Button>Edit Client</Button>
          </div>
        </p>
      </div>
      <div className="container d-xl-block">
        <p className="fs-2 fw-bold text-start">Informations</p>
        <div className="row">
          <div className="col-md-6">
            <p className="fs-5 text-start">
              Tel: <span>{selectedClient?.Tel}</span>
            </p>
          </div>
          <div className="col-md-6">
            <p className="fs-5 text-start">
              Address: <span>{selectedClient?.Address}</span>
            </p>
          </div>
          <div className="col-md-6">
            <p className="fs-5 text-start">
              All work: <span>{totalWorks}</span>
            </p>
          </div>
          <div className="col-md-6">
            <p className="fs-5 text-start">
              Active work: <span>{activeWorks}</span>
            </p>
          </div>
          <div className="col-md-6">
            <p className="fs-5 text-start">
              Still has to pay: <span>{stillToPay}</span> RON
            </p>
          </div>
        </div>
      </div>

      <div className="container d-xl-block">
        <div className="d-flex justify-content-between align-items-center">
          <p className="fs-2 fw-bold text-start">Recent works</p>
          <div>
            <Button variant="primary" onClick={() => {}} className="me-3">
              New work
            </Button>
          </div>
        </div>
        <div className="d-flex justify-content-between mb-2">
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
            <ClientWorkListItem key={work.Id} work={work} />
          ))}
        </ListGroup>
      </div>
    </>
  );
}

export default ClientAnalyzer;
