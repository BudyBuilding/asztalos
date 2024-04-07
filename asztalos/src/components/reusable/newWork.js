import React, { useState } from "react";
import { Button, Container, Dropdown } from "react-bootstrap";
import FurnitureItem from "./furnitureItem";

function NewWork() {
  const [types, setTypes] = useState([
    "Kitchen",
    "Living Room",
    "Wardrobe",
    "Bedroom",
    "Warehouse",
    "Living Room",
    "Wardrobe",
    "Bedroom",
    "Warehouse",
    "Living Room",
    "Wardrobe",
    "Bedroom",
    "Warehouse",
    "Living Room",
    "Wardrobe",
    "Bedroom",
    "Warehouse",
  ]);

  const [selectedPlace, setSelectedPlace] = useState(null);

  const handleSelectPlace = (place) => {
    setSelectedPlace(place);
  };

  return (
    <>
      {/*   <Container className="d-flex align-content-center ">
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
      <Container className="d-xl-block">
        <div className="d-flex flex-nowrap overflow-x-scroll">
          {types.map((type, index) => (
            <div
              key={index}
              className="p-3 border rounded mx-2 justify-content-start align-items-center"
              style={{ width: "100px", height: "100px" }}
            >
              {type}
            </div>
          ))}
        </div>
          </Container>
      <Container>
        <p className="fs-1 fw-bold text-start">New work</p>
      </Container>
      <Container>
        <Button variant="primary" onClick={() => {}} className="me-3">
          New item
        </Button>
        <Button variant="primary" onClick={() => {}} className="me-3">
          Check all
        </Button>
      </Container>
          */}
      {/************************************* */}
      <Container className="w-100 mt-4 p-0">
        {/************************************* */}
        {/**settings */}
        <Container
          className="flex-fill border rounded-4 p-3"
          style={{ height: "600px" }}
        >
          <h2 className="fw-bold">Settings</h2>
          <Container className="d-flex">
            <Container>
              {Array.from({ length: 10 }).map((_, index) => (
                <Container key={index} className="d-flex align-items-center">
                  <span className="me-4">Roof:</span>
                  <Dropdown>
                    <Dropdown.Toggle
                      className="h-75 align-content-center ms-4"
                      variant="primary"
                      id={`dropdown-basic-${index}`}
                    >
                      Full
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item href={`#/action-1-${index}`}>
                        Full
                      </Dropdown.Item>
                      <Dropdown.Item href={`#/action-2-${index}`}>
                        2 stands
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </Container>
              ))}
            </Container>
            <Container>
              {Array.from({ length: 10 }).map((_, index) => (
                <Container key={index} className="d-flex align-items-center">
                  <span className="me-4">Roof:</span>
                  <Dropdown>
                    <Dropdown.Toggle
                      className="h-75 align-content-center ms-4"
                      variant="primary"
                      id={`dropdown-basic-${index}`}
                    >
                      Full
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item href={`#/action-1-${index}`}>
                        Full
                      </Dropdown.Item>
                      <Dropdown.Item href={`#/action-2-${index}`}>
                        2 stands
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </Container>
              ))}
            </Container>
          </Container>
          {/** */}
        </Container>

        <Container className="d-flex p-0 justify-content-between ">
          {/************************************* */}
          {/** Required items*/}
          {/*
          <Container
            className="flex-fill me-4 border rounded-4 p-0"
            style={{ height: "600px" }}
          >
            <h2 className="fw-bold">Required Pieces</h2>
            <Container
              className="text-start overflow-y-scroll p-0"
              style={{ maxHeight: "450px" }}
            >
              <Container className="pal p-0">
                <Container className="first-row">
                  <h2 className="fs-4">PAL</h2>
                </Container>
                <Container className="items p-0">
                  <h2 className="fs-4 ">121 FS 01</h2>
                  <FurnitureItem
                    l={"150"}
                    w={"700"}
                    q={5}
                    c={"04"}
                    lc={2}
                    wc={1}
                    r={false}
                  />
                  <FurnitureItem
                    l={"150"}
                    w={"700"}
                    q={5}
                    c={"04"}
                    lc={2}
                    wc={1}
                    r={false}
                  />
                  <FurnitureItem
                    l={"150"}
                    w={"700"}
                    q={5}
                    c={"04"}
                    lc={2}
                    wc={1}
                    r={false}
                  />
                  <FurnitureItem
                    l={"150"}
                    w={"700"}
                    q={5}
                    c={"04"}
                    lc={2}
                    wc={1}
                    r={false}
                  />
                  <FurnitureItem
                    l={"150"}
                    w={"700"}
                    q={5}
                    c={"04"}
                    lc={2}
                    wc={1}
                    r={false}
                  />
                  <FurnitureItem
                    l={"150"}
                    w={"700"}
                    q={5}
                    c={"04"}
                    lc={2}
                    wc={1}
                    r={false}
                  />
                  <FurnitureItem
                    l={"150"}
                    w={"700"}
                    q={5}
                    c={"04"}
                    lc={2}
                    wc={1}
                    r={false}
                  />
                </Container>
              </Container>
              <Container className="mdf">
                <Container className="first-row">
                  <h2 className="fs-4">MDF</h2>
                </Container>
                <Container className="items"></Container>
              </Container>
              <Container className="PFL">
                <Container className="first-row">
                  <h2 className="fs-4">PFL</h2>
                </Container>
                <Container className="items"></Container>
              </Container>
            </Container>
        </Container>*/}
          {/************************************* */}
          {/** Model */}
          <Container
            className="flex-fill border rounded-4 p-0"
            style={{ height: "600px" }}
          >
            <h2 className="fw-bold">Furniture Model</h2>
            <div
              className="flex-fill me-auto border p-3 overflow-y-scroll"
              style={{ height: "100px" }}
            ></div>
          </Container>
        </Container>
      </Container>
    </>
  );
}

export default NewWork;
