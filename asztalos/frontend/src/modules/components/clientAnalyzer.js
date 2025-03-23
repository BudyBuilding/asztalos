// ClientAnalyzer.js
// here user can analyze a selected client, user could check what did the client payed and how many must he still pays
// also the user can see the clients works and can modify them

import React, { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { Button, ListGroup, Modal } from "react-bootstrap";
import Loading from "../helpers/Loading";
import ClientWorkListItem from "../helpers/ClientWorkListItem";
import ClientUpdateModal from "../modals/ClientUpdateModal";
import NewWorkModal from "../modals/newWorkModal.js";
import {
  fetchCreatedItemsForWork,
  fetchCreatedTablesForWork,
  fetchObjectsForWork,
  fetchTables
} from "../../data/storeManager";
import sorting from "../helpers/sort";
import clientApi from "../../data/api/clientApi";
import workApi from "../../data/api/workApi";
import { getClientById } from "../../data/getters";
import { selectWork } from "../../data/store/actions/workStoreFunctions";
import { useNavigate } from "react-router-dom";
import ErrorModal from "../helpers/ErrorModal";

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
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 1 });
  const [error, setError] = useState("");

  const allWorks = useSelector((state) => state.works);
  let memoizedWorks = useMemo(
    () => allWorks.filter((work) => (work.client.clientId == clientId)),
    [allWorks, clientId]
  );
  //console.log(allWorks);
  // we should call a load function every time when me must render
  // to the rerendering is asigned a variable, if that variable is changing then the clientanalyzer must be rerendered
  useEffect(() => {
    load();
  }, [render]);
/*
  for (let i = 0; i < allWorks.length; i++) {
    console.log(allWorks[i].client.clientId);
  }*/

  // the load function, if fails then must open an errormodal and give a button which navigates back to the dashboard
  async function load() {
    setLoading(true);
    try {
      setSelectedClient(await dispatch(getClientById(clientId)));
    } catch (err) {
      setError("Failed to load client data");
    } finally {
      setLoading(false);
    }
  }
 // console.log(clientId, clientId + 0);

  // this is the function which is called if the user need a rerender
  function rerender() {
    setRender(!render);
  }

  // the user must track all the works of a client
  const totalWorks = memoizedWorks.length;

  // the user must track the active works of a client
  const activeWorks = memoizedWorks.filter(
    (work) => work.status === "In Progress"
  ).length;

  // the stillToPay variable contains the amount of money which must be payed by the client to the user
  const stillToPay = memoizedWorks.reduce(
    (acc, work) => acc + (work.price - work.paid),
    0
  );

  // this function requests a sort by the "key" paramater of the list
  const requestSort = (key) => {
    let direction = 1;
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 1) {
      direction = 2;
    }
    if (key === "Status") {
      direction = sortConfig.direction === 4 ? 1 : sortConfig.direction + 1;
    }
    setSortConfig({ key, direction });
    memoizedWorks = sorting(memoizedWorks, { key, direction });
  };

  // handleNewWorkClick opens the modal for creating a new work to this client
  const handleNewWorkClick = () => {
    setShowNewWork(true);
  };

  // closeNewWork closes the modal for creating a new work to this client
  const closeNewWork = () => {
    setShowNewWork(false);
  };

  // handleNewWork handles the newly created work of this client
  const handleNewWork = async (newWork) => {
    try {
      await dispatch(workApi.createWorkApi(newWork));
      setShowNewWork(false);
    } catch (error) {
      setError("Failed to create new work");
      console.error("Error creating new work:", error);
    }
  };

  // handleWorkDelete deletes the choosen work of this client
  const handleWorkDelete = async (workId) => {
    try {
      await dispatch(workApi.deleteWorkApi(workId));
      rerender();
    } catch (error) {
      setError("Failed to delete work");
      console.error("Error deleting work:", error);
    }
  };

  // handleNewWorkClick opens the modal for creating a new work to this client
  const handleClientUpdateClose = () => {
    setShowClientUpdateModal(false);
  };

  // handleClientUpdate opens the modal for updating this client
  const handleClientUpdate = async (updatedClientData) => {
    try {
      await dispatch(
        clientApi.updateClientApi(selectedClient.clientId, updatedClientData)
      );
      setShowClientUpdateModal(false);
      rerender();
    } catch (error) {
      setError("Failed to update client");
      console.error("Error updating client:", error);
    }
  };

  // handleSelectWork selecting a work
  // loads the tables related to this work
  // loads the created items related to this work
  // loads the objects related to this work
  const handleSelectWork = async (workId) => {
    setLoading(true);
    try {
      await dispatch(selectWork(workId));
      await fetchTables(workId);
      navigate(`/workAnalyzer/${workId}`);
      await fetchObjectsForWork(workId);
    } catch (error) {
      setError("Failed to select work");
      console.error("Error while selecting work:", error);
    } finally {
      setLoading(false);
    }
    try {
      await fetchCreatedItemsForWork(workId);
    } catch (error) {
      setError("Failed to fetch created items for work");
      console.error("Error while fetching created items:", error);
    }
    try {
      await fetchCreatedTablesForWork(workId);
    } catch (error) {
      setError("Failed to fetch created items for work");
      console.error("Error while fetching created items:", error);
    }


  };

  // handleCloseErrorModal closes the error modal
  const handleCloseErrorModal = () => {
    setError("");
  };

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <>
          {error && (
            <ErrorModal error={error} onClose={handleCloseErrorModal} />
          )}
          {selectedClient ? (
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
              <Modal
                show={showClientUpdateModal}
                onHide={handleClientUpdateClose}
              >
                <ClientUpdateModal
                  handleClose={handleClientUpdateClose}
                  clientId={selectedClient?.clientId}
                  onUpdate={handleClientUpdate}
                />
              </Modal>
              <div className="container d-xl-block">
                <div className="fs-3 text-start d-flex justify-content-between">
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
                        marginLeft: "0.5rem"
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
                      onClick={handleNewWorkClick}
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
                  <Button
                    variant="primary"
                    onClick={() => requestSort("status")}
                  >
                    Status
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => requestSort("Price")}
                  >
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
          ) : (
            <>
              <ErrorModal
                error={"There is no client to load, please try again later"}
                onClose={handleCloseErrorModal}
              />
              <div className="d-flex justify-content-center mt-3">
                <Button
                  variant="primary"
                  onClick={() => navigate("/UserDashboard")}
                  style={{ border: "1px solid #007bff" }}
                >
                  Back to dashboard
                </Button>
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}

export default ClientAnalyzer;
