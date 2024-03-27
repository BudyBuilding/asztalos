import React, { useState } from "react";
import { Button, ListGroup } from "react-bootstrap";
import { Row, Col } from "react-bootstrap";

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

  return (
    <>
      <div class="container d-xl-block">
        <p className="fs-3  text-start">
          <span className="fs-1 fw-bold">Chereju Clau</span>
          &nbsp; client
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
              Price: <span>2789</span> RON
            </p>
          </div>
          <div className="col-md-6">
            <p className="fs-5 text-start">
              Payed sum: <span>500</span> RON
            </p>
          </div>
          <div className="col-md-6">
            <p className="fs-5 text-start">
              Still has to pay: <span>2289</span> RON
            </p>
          </div>
        </div>
      </div>

      <div class="container d-xl-block">
        <div className="d-flex justify-content-between align-items-center">
          <p className="fs-2 fw-bold text-start">Files</p>
        </div>

        <Row xs={1} md={3} className="g-4">
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

        <ListGroup>
          {/**
          {works.map((work) => (
            <ClientWorkListItem key={work.Id} work={work} />
          ))}
          *  */}
        </ListGroup>
      </div>
    </>
  );
}

export default WorkAnalyzer;
