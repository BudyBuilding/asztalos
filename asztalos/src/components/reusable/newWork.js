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
      <Container className="mt-4">
        <Container className="d-flex justify-content-between ">
          <Container
            className="flex-fill me-4 border rounded-4 p-3"
            style={{ height: "600px" }}
          >
            <h2 className="fw-bold">Furniture Model</h2>
            <div
              className="flex-fill me-auto border p-3 overflow-y-scroll"
              style={{ height: "100px" }}
            ></div>
          </Container>
          <Container
            className="flex-fill me-4 border rounded-4 p-3"
            style={{ height: "600px" }}
          >
            <h2 className="fw-bold">Required Pieces</h2>
            <Container
              className="text-start overflow-y-scroll"
              style={{ maxHeight: "450px" }}
            >
              <Container className="pal">
                <Container className="first-row">
                  <h2 className="fs-4">PAL</h2>
                </Container>
                <Container className="items ps-4">
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
          </Container>
          <Container
            className="flex-fill me-4 border rounded-4 p-3"
            style={{ height: "600px" }}
          >
            <h2 className="fw-bold">Other Settings</h2>
          </Container>
        </Container>
      </Container>
    </>
  );
}

export default NewWork;
