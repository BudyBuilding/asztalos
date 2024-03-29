import React, { useState } from "react";
import { Container, Dropdown } from "react-bootstrap";

import NewClient from "./newClient";

function NewWork() {
  return (
    <>
      <Container>
        <p className="fs-1 fw-bold text-start">New work</p>
      </Container>{" "}
      <Container className="d-flex align-content-center ">
        <span className="fs-2 fw-bold text-start">Place</span>
        <Dropdown>
          <Dropdown.Toggle
            className="h-75 align-content-center ms-4"
            variant="primary"
            id="dropdown-basic"
          >
            Select Place
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item href="#/action-1">Kitchen</Dropdown.Item>
            <Dropdown.Item href="#/action-2">Living Room</Dropdown.Item>
            <Dropdown.Item href="#/action-3">Wardrobe</Dropdown.Item>
            <Dropdown.Item href="#/action-4">Bedroom</Dropdown.Item>
            <Dropdown.Item href="#/action-5">Warehouse</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </Container>
      {/**Clients */}
      {/*
        <Container className="d-xl-block">
          <p className="fs-2 fw-bold text-start">Clients</p>
          <div className="d-flex flex-nowrap overflow-x-scroll">
            <div
              className="p-3 border rounded"
              style={{ minWidth: "200px", margin: "10px" }}
            >
              <p className="fw-bold d-flex justify-content-center align-items-center w-100 h-100 fs-4">
                New client
              </p>
            </div>{" "}
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
      */}
    </>
  );
  /*  const [clients, setClients] = useState([
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
 ]);
 */
}

export default NewWork;
