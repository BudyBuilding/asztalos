import React, { useState } from "react";
import { Button, ListGroup, Table } from "react-bootstrap";
import { Row, Col } from "react-bootstrap";
import { getAllTables, getClientById, getWorkById } from "../data/getters";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";

function WorkAnalyzer() {
  const [files, setFiles] = useState([
    {
      id: 1,
      name: "121 FS 01",
    },
    {
      id: 2,
      name: "PFL",
    },
    {
      id: 3,
      name: "Vasalás",
    },
    {
      id: 1,
      name: "121 FS 01",
    },
    {
      id: 2,
      name: "PFL",
    },
    {
      id: 3,
      name: "Vasalás",
    },
    {
      id: 1,
      name: "121 FS 01",
    },
    {
      id: 2,
      name: "PFL",
    },
    {
      id: 3,
      name: "Vasalás",
    },
    {
      id: 1,
      name: "121 FS 01",
    },
    {
      id: 2,
      name: "PFL",
    },
    {
      id: 3,
      name: "Vasalás",
    },
    {
      id: 1,
      name: "121 FS 01",
    },
    {
      id: 2,
      name: "PFL",
    },
    {
      id: 3,
      name: "Vasalás",
    },
  ]);

  const [woods, setWoods] = useState([
    {
      id: 1,
      color: "121 FS 01",
      quantity: 2,
      type: "tables",
      price: 658,
    },
    {
      id: 2,
      color: "Gizir 6010",
      quantity: 1,
      type: "tables",
      price: 400,
    },
    {
      id: 3,
      color: "PFL",
      quantity: 2,
      type: "tables",
      price: 200,
    },
    {
      id: 4,
      color: "MDF Alb Ultra Mat A62/P",
      quantity: 1.3,
      type: "m2",
      price: 500,
    },
  ]);

  const [metals, setMetals] = useState([
    { id: 1, name: "Balama Hafele", quantity: 37, type: "pcs", price: 278 },
    { id: 2, name: "6010 Gizir", quantity: 1, type: "tables", price: 400 },
    { id: 3, name: "PFL", quantity: 2, type: "tables", price: 200 },
    { id: 4, name: "121 FS 01", quantity: 2, type: "tables", price: 658 },
  ]);

  const dispatch = useDispatch();
  const { workId } = useParams();

  const selectedWork = dispatch(getWorkById(workId));
  const selectedClient = selectedWork.client;

  const tables = dispatch(getAllTables());
  const woodsPrice = tables.reduce((sum, table) => sum + table.price, 0); // Összegezd az árakat

  return (
    <>
      {/** Top line, name and button */}
      <div className="container d-xl-block">
        <div className="d-flex justify-content-between align-items-center">
          <p className="fs-3 text-start mb-0">
            <span className="fs-1 fw-bold me-2">{selectedClient.name}</span>
            <span className="fs-5">client</span>
          </p>
          <Button variant="primary" onClick={() => {}} className="ms-auto">
            Order
          </Button>
        </div>
      </div>

      {/** Basic informations */}
      <div className="container d-xl-block">
        <p className="fs-2 fw-bold text-start">Informations</p>
        <div className="row">
          <div className="col-md-6">
            <p className="fs-5 text-start">
              Tel: <span>{selectedClient.telephone}</span>
            </p>
          </div>
          <div className="col-md-6">
            <p className="fs-5 text-start">
              Address: <span>{selectedClient.address}</span>
            </p>
          </div>
          <div className="col-md-6">
            <p className="fs-5 text-start">
              Wood price: <span>{woodsPrice}</span> RON
            </p>
          </div>
          <div className="col-md-6">
            <p className="fs-5 text-start">
              Metals price: <span>* Not implemented yet *</span> RON
            </p>
          </div>
          <div className="col-md-6">
            <p className="fs-5 text-start">
              Price: <span>{selectedWork.price}</span> RON
            </p>
          </div>
          <div className="col-md-6">
            <p className="fs-5 text-start">
              Label : <span>{selectedWork.label}</span> RON
            </p>
          </div>
          <div className="col-md-6">
            <p className="fs-5 text-start">
              Payed sum: <span>{selectedWork.paid}</span> RON
            </p>
          </div>
          <div className="col-md-6">
            <p className="fs-5 text-start">
              Still has to pay:{" "}
              <span>{selectedWork.price - selectedWork.paid}</span> RON
            </p>
          </div>
          <div className="col-md-6">
            <p className="fs-5 text-start">
              Work status: <span>{selectedWork.status}</span>
            </p>
          </div>
          <div className="col-md-6">
            <p className="fs-5 text-start">
              Work id: <span>{selectedWork.workId}</span>
            </p>
          </div>
        </div>
      </div>

      {/** Measurements */}
      <div className="container d-xl-block">
        <p className="fs-2 fw-bold text-start">Measurements</p>

        {/** Woods */}
        <p className="fs-3 fw-bold text-start">Wood </p>
        <div className="row">
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Quantity</th>
                  <th>Type</th>
                  <th>Price</th>
                  <th>Price per quantity</th>
                </tr>
              </thead>
              <tbody>
                {tables.map((table) => (
                  <tr key={table.id}>
                    <td>{table.name}</td>
                    <td>{table.quantity}</td>
                    <td>{table.type}</td>
                    <td>{table.price}</td>
                    <td>{table.priceperQty}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Row className="justify-content-end">
              <Col xs="auto">
                <h5>Total Price: {woodsPrice}</h5>
              </Col>
            </Row>
          </div>
        </div>
        {/** Metals */}
        {/*
        <p className="fs-3 fw-bold text-start">Metal</p>
        <div className="row">
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Quantity</th>
                  <th>Type</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {metals.map((metals) => (
                  <tr key={metals.id}>
                    <td>{metals.id}</td>
                    <td>{metals.name}</td>
                    <td className="d-flex justify-content-center align-items-center">
                      <Button
                        className="d-flex justify-content-center align-items-center"
                        variant="danger"
                        onClick={() => {}}
                      >
                        -
                      </Button>
                      <p className="mg-auto w-25 text-center h-100 ">
                        {metals.quantity}
                      </p>
                      <Button
                        className="d-flex justify-content-center align-items-center h-50"
                        variant="success"
                        onClick={() => {}}
                      >
                        +
                      </Button>
                    </td>
                    <td>{metals.type}</td>
                    <td>{metals.price}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Row className="justify-content-end">
              <Col xs="auto">
                <h5>
                  Total Price: <span>1061</span>
                </h5>
              </Col>
            </Row>
          </div>
        </div>
      */}
      </div>
      {/** Model */}
      <div className="container d-xl-block">
        <p className="fs-2 fw-bold text-start">Model</p>
        <div
          className="d-flex flex-column align-items-center m-auto justify-content-center"
          style={{
            width: "100%",
            height: "40rem",
            borderRadius: "2rem",
            border: "1px solid #ccc", // Doboz keret
          }}
        ></div>
      </div>

      {/** Files list */}
      <div className="container d-xl-block">
        <div className="d-flex justify-content-between align-items-center">
          <p className="fs-2 fw-bold text-start ">Files</p>
        </div>

        <Row xs={1} md={6} className="g-4">
          {files.map((file, index) => (
            <Col key={index}>
              <div
                className="d-flex flex-column align-items-center justify-content-center"
                style={{
                  width: "13rem",
                  height: "10rem",
                  borderRadius: "2rem",
                  border: "1px solid #ccc", // Doboz keret
                }}
              ></div>
              <div
                className="d-flex flex-column align-items-start w-100 justify-content-center"
                style={{ margin: "1rem" }}
              >
                {file.name}
              </div>
            </Col>
          ))}
        </Row>
      </div>
    </>
  );
}

export default WorkAnalyzer;
