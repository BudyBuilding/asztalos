import React, { useState, useMemo } from "react";
import { Button, ListGroup } from "react-bootstrap";
import ClientWorkListItem from "./clientWorksListItem";
import { useSelector } from "react-redux";
import sorting from "./sort";
import { useParams } from "react-router-dom";
import NewWork from "./newWork";

function ClientAnalyzer() {
  const { clientId } = useParams();

  const [showNewWork, setShowNewWork] = useState(false);

  const allWorks = useSelector((state) => state.works);
  const allClients = useSelector((state) => state.clients);

  const memoizedWorks = useMemo(
    () => allWorks.filter((work) => work.ClientId == clientId),
    [allWorks, clientId]
  );
  const selectedClient = useMemo(
    () => allClients.find((c) => c.ClientId == clientId),
    [allClients, clientId]
  );

  console.log(clientId);
  const totalWorks = memoizedWorks.length;
  const activeWorks = memoizedWorks.filter(
    (work) => work.Status === "In Progress"
  ).length;
  const stillToPay = memoizedWorks.reduce(
    (acc, work) => acc + (work.Price - work.Paid),
    0
  );
  //

  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 1, // Default direction is ascending
  });

  const requestSort = (key) => {
    let direction = 1; // Default direction is ascending

    if (sortConfig && sortConfig.key === key && sortConfig.direction === 1) {
      direction = 2; // Change to descending if already ascending
    }

    if (key === "Status") {
      direction = sortConfig.direction === 4 ? 1 : sortConfig.direction + 1;
    }

    setSortConfig({ key, direction });
    memoizedWorks = sorting(memoizedWorks, { key, direction });
  };

  const handleNewWorkClick = () => {
    setShowNewWork(true);
  };

  const closeNewWork = () => {
    setShowNewWork(false);
  };
  return (
    <>
      {showNewWork ? (
        <NewWork closeNewWork={closeNewWork} client={selectedClient} />
      ) : (
        <>
          <div className="container d-xl-block">
            <div className="fs-3  text-start d-flex justify-content-between">
              <div>
                <span className="fs-1 fw-bold">{selectedClient?.Name}</span>
                &nbsp; works
              </div>
              <div>
                <Button>Edit Client</Button>
              </div>
            </div>
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
                <Button
                  variant="primary"
                  onClick={() => {
                    handleNewWorkClick();
                  }}
                  className="me-3"
                >
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
              {memoizedWorks.map((work) => (
                <ClientWorkListItem key={work.workId} work={work} />
              ))}
            </ListGroup>
          </div>
        </>
      )}
    </>
  );
}

export default ClientAnalyzer;
