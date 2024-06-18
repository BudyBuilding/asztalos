import React, { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import store from "../data/store/store";
import { useParams } from "react-router-dom";

import { Button, ListGroup } from "react-bootstrap";
import { Modal } from "react-bootstrap";
import Loading from "./Loading";

import ClientWorkListItem from "./clientWorksListItem";
import ClientUpdateModal from "./ClientUpdateModal";

import sorting from "./sort";
import { deleteWork } from "../data/api/apiService";
import clientApi from "../data/api/clientApi";
import workApi from "../data/api/workApi";
import { getClientById } from "../data/getters";
import { selectWork } from "../data/store/actions/workStoreFunctions";
import { fetchTables } from "./managers/storeManager";
import { useNavigate } from "react-router-dom";
import NewWorkModal from "./newWorkModal";

function ClientAnalyzer() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { clientId } = useParams();

  const [showNewWork, setShowNewWork] = useState(false);
  const [showClientUpdateModal, setShowClientUpdateModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(
    dispatch(getClientById(clientId))
  );
  const [render, setRender] = useState(true);
  const [loading, setLoading] = useState(selectedClient ? false : true);
  const allWorks = useSelector((state) => state.works);
  const memoizedWorks = useMemo(
    () => allWorks.filter((work) => work.client.clientId == clientId),
    [allWorks, clientId]
  );

  useEffect(() => {
    load();
  }, [render]);

  async function load() {
    setSelectedClient(await dispatch(getClientById(clientId)));
  }

  function rerender() {
    setRender(!render);
  }

  const totalWorks = memoizedWorks.length;
  const activeWorks = memoizedWorks.filter(
    (work) => work.status === "In Progress"
  ).length;
  const stillToPay = memoizedWorks.reduce(
    (acc, work) => acc + (work.price - work.paid),
    0
  );

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

  const handleNewWork = async (newWork) => {
    await dispatch(workApi.createWorkApi(newWork));
    setShowNewWork(false);
  };

  const handleWorkDelete = async (workId) => {
    await dispatch(workApi.deleteWorkApi(workId));
    rerender();
  };

  const handleClientUpdateClose = () => {
    setShowClientUpdateModal(false);
  };

  const handleClientUpdate = async (updatedClientData) => {
    await dispatch(
      clientApi.updateClientApi(selectedClient.clientId, updatedClientData)
    );
    setShowClientUpdateModal(false);
    rerender();
  };

  const handleSelectWork = async (workId) => {
    setLoading(true);
    try {
      dispatch(selectWork(workId));
      fetchTables(workId);
      navigate(`/workAnalyzer/${workId}`);
      setLoading(false);
    } catch (error) {
      console.error("Error while selecting work:", error);
      setLoading(false);
    }
  };

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <>
          <Modal show={showNewWork} onHide={closeNewWork}>
            <Modal.Header closeButton>
              <Modal.Title> Create new work</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <NewWorkModal
                show={showNewWork}
                handleClose={closeNewWork}
                onSubmit={handleNewWork}
              />
            </Modal.Body>
          </Modal>
          <Modal show={showClientUpdateModal} onHide={handleClientUpdateClose}>
            <ClientUpdateModal
              handleClose={handleClientUpdateClose}
              clientId={selectedClient.clientId}
              onUpdate={handleClientUpdate}
            />
          </Modal>

          <div className="container d-xl-block">
            <div className="fs-3  text-start d-flex justify-content-between">
              <div>
                <span className="fs-1 fw-bold">{selectedClient?.name}</span>
                &nbsp; works
              </div>
              <div>
                <Button
                  variant="primary"
                  onClick={() => setShowClientUpdateModal(true)}
                  style={{
                    border: "1px solid #007bff",
                    marginLeft: "0.5rem",
                  }}
                >
                  Edit Client
                </Button>
              </div>
            </div>
          </div>
          <div className="container d-xl-block">
            <p className="fs-2 fw-bold text-start">Informations</p>
            <div className="row">
              <div className="col-md-6">
                <p className="fs-5 text-start">
                  Tel: <span>{selectedClient?.telephone}</span>
                </p>
              </div>
              <div className="col-md-6">
                <p className="fs-5 text-start">
                  Address: <span>{selectedClient?.address}</span>
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
              <Button variant="primary" onClick={() => requestSort("status")}>
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
              {memoizedWorks.length === 0 ? (
                <p>There is no work yet.</p>
              ) : (
                memoizedWorks.map((work) => (
                  <ClientWorkListItem
                    key={work.workId}
                    work={work}
                    onDelete={handleWorkDelete}
                    onClick={handleSelectWork}
                  />
                ))
              )}
            </ListGroup>
          </div>
        </>
      )}
    </>
  );
}

export default ClientAnalyzer;
