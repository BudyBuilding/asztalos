import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button, Container, Dropdown, Nav } from "react-bootstrap";
import FurnitureItem from "./furnitureItem";
import ColorSelector from "./colorSelector"; // Importing ColorSelector
import store from "../data/store/store";
import processScript from "../calculation/itemGenerator/processScript";
function NewWork() {
  const [types, setTypes] = useState(["Kitchen", "Living Room", "Wardrobe"]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [showColorSelector, setShowColorSelector] = useState(false); // State for ColorSelector
  const [showColors, setShowColors] = useState(false);
  const [selectedSettingKeys, setSelectedSettingKeys] = useState([]);
  const [selectedTab, setSelectedTab] = useState("0");

  const [objects, setObjects] = useState([
    {
      name: "All",
      key: 0,
      values: {
        red: 5,
        blue: 10,
        table: 3,
        chair: 8,
      },
    },
    {
      name: "Sofa",
      key: 1,
      values: {
        color: "green",
        size: {
          width: 200,
          height: 100,
        },
      },
    },
    {
      name: "Bed",
      key: 2,
      values: {
        color: "blue",
        size: {
          width: 180,
          height: 200,
        },
      },
    },
    {
      name: "Bed1",
      key: 3,
      values: {
        color: "blue",
        size: {
          width: 180,
          height: 200,
        },
      },
    },
    {
      name: "Bed2",
      key: 4,
      values: {
        color: "blue",
        size: {
          width: 180,
          height: 200,
        },
      },
    },
    {
      name: "Bed3",
      key: 5,
      values: {
        color: "blue",
        size: {
          width: 180,
          height: 200,
        },
      },
    },
  ]);

  const [items, setItems] = useState([
    {
      name: "All",
      key: 0,
      items: {
        0: {
          length: 464,
          width: 318,
          cantType: "2",
          longCant: 1,
          shortCant: 0,
          pcs: 2,
          type: "121 FS 01",
        },
        1: {
          length: 464,
          width: 318,
          cantType: "2",
          longCant: 1,
          shortCant: 0,
          pcs: 2,
          type: "121 FS 01",
        },
        2: {
          length: 464,
          width: 318,
          cantType: "2",
          longCant: 1,
          shortCant: 0,
          pcs: 2,
          type: "121 FS 01",
        },
      },
    },
    {
      name: "Sofa",
      key: 1,
      items: {
        0: {
          length: 464,
          width: 318,
          cantType: "2",
          longCant: 1,
          shortCant: 0,
          pcs: 2,
          type: "121 FS 01",
        },
        1: {
          length: 464,
          width: 318,
          cantType: "2",
          longCant: 1,
          shortCant: 0,
          pcs: 2,
          type: "121 FS 01",
        },
        2: {
          length: 464,
          width: 318,
          cantType: "2",
          longCant: 1,
          shortCant: 0,
          pcs: 2,
          type: "121 FS 01",
        },
      },
    },
    {
      name: "Bed",
      key: 2,
      items: {
        0: {
          length: 464,
          width: 318,
          cantType: "2",
          longCant: 1,
          shortCant: 0,
          pcs: 2,
          type: "121 FS 01",
        },
        1: {
          length: 464,
          width: 318,
          cantType: "2",
          longCant: 1,
          shortCant: 0,
          pcs: 2,
          type: "121 FS 01",
        },
        2: {
          length: 464,
          width: 318,
          cantType: "2",
          longCant: 1,
          shortCant: 0,
          pcs: 2,
          type: "121 FS 01",
        },
      },
    },
    {
      name: "Bed1",
      key: 3,
      items: {
        0: {
          length: 464,
          width: 318,
          cantType: "2",
          longCant: 1,
          shortCant: 0,
          pcs: 2,
          type: "121 FS 01",
        },
        1: {
          length: 464,
          width: 318,
          cantType: "2",
          longCant: 1,
          shortCant: 0,
          pcs: 2,
          type: "121 FS 01",
        },
        2: {
          length: 464,
          width: 318,
          cantType: "2",
          longCant: 1,
          shortCant: 0,
          pcs: 2,
          type: "121 FS 01",
        },
      },
    },
    {
      name: "Bed2",
      key: 4,
      items: {
        0: {
          length: 464,
          width: 318,
          cantType: "2",
          longCant: 1,
          shortCant: 0,
          pcs: 2,
          type: "121 FS 01",
        },
        1: {
          length: 464,
          width: 318,
          cantType: "2",
          longCant: 1,
          shortCant: 0,
          pcs: 2,
          type: "121 FS 01",
        },
        2: {
          length: 464,
          width: 318,
          cantType: "2",
          longCant: 1,
          shortCant: 0,
          pcs: 2,
          type: "121 FS 01",
        },
      },
    },
    {
      name: "Bed3",
      key: 5,
      items: {
        0: {
          length: 464,
          width: 318,
          cantType: "2",
          longCant: 1,
          shortCant: 0,
          pcs: 2,
          type: "121 FS 01",
        },
        1: {
          length: 464,
          width: 318,
          cantType: "2",
          longCant: 1,
          shortCant: 0,
          pcs: 2,
          type: "121 FS 01",
        },
        2: {
          length: 464,
          width: 318,
          cantType: "2",
          longCant: 1,
          shortCant: 0,
          pcs: 2,
          type: "121 FS 01",
        },
      },
    },
  ]);

  const [selectedSettings, setSelectedSettings] = useState(objects);
  const [selectedItems, setSelectedItems] = useState(items);

  function handleShowObjectSetting(key) {
    let showedSettings = [...selectedSettingKeys];
    if (showedSettings.includes(key)) {
      showedSettings = showedSettings.filter((k) => k !== key);
    } else {
      showedSettings.push(key);
    }
    setSelectedSettingKeys(showedSettings);
  }

  const [selectedItemKeys, setSelectedItemKeys] = useState([]);

  function handleShowItemSetting(key) {
    let showedItems = [...selectedItemKeys];
    if (showedItems.includes(key)) {
      showedItems = showedItems.filter((k) => k !== key);
    } else {
      showedItems.push(key);
    }
    setSelectedItemKeys(showedItems);
  }

  const PFLScript = {
    items: [
      [
        "measurements.height - 5",
        "measurements.width - 5",
        "0",
        "0",
        "0",
        "1",
        "PFL",
      ],
    ],
  };
  const keretScript = {
    config: {
      PFL: true,
    },
    items: [
      ["measurements.height", "measurements.depth", "2", "1", "2", "2", "side"],
      [
        "measurements.width - 2 * thickness",
        "measurements.depth",
        "2",
        "1",
        "0",
        "2",
        "roof",
      ],
    ],
    CurrentScripts: ["PFLScript"],
  };

  const measurements = {
    height: 1000,
    width: 500,
    depth: 320,
  };

  const thickness = 18;

  const processedScript = processScript(keretScript, measurements, thickness);

  useEffect(() => {
    if (selectedTab == "0") {
      setSelectedSettings(objects);
      setSelectedItems(items);
    } else {
      objects.map((obj) => {
        if (obj.key == selectedTab) {
          setSelectedSettings([obj]);
        }
      });
      items.map((item) => {
        if (item.key == selectedTab) {
          setSelectedItems([item]);
        }
      });
    }
  }, [selectedTab]);

  ////////////////////////////////
  {
    const handleSelectPlace = (place) => {
      setSelectedPlace(place);
    };

    const colors = useSelector((state) => state.colors);
    const dispatch = useDispatch();

    function closeSelector() {
      setShowColorSelector(false);
      console.log(showColorSelector);
    }

    useEffect(() => {
      dispatch({ type: "LOAD_COLORS" });
    }, [dispatch]);
  }
  ////////////////////////////////
  return (
    <>
      <Nav
        className="pt-5"
        variant="tabs"
        defaultActiveKey="0"
        onSelect={(selectedKey) => {
          if (selectedKey !== selectedTab) {
            console.log("change from: ", selectedTab, " to: ", selectedKey);
            setSelectedTab(selectedKey);
          }
        }}
      >
        <Nav.Item key={"10000"}>
          <Nav.Link eventKey="newObject">New Object</Nav.Link>
        </Nav.Item>

        {objects.map((obj) => {
          return (
            <>
              <Nav.Item key={obj.key}>
                <Nav.Link eventKey={obj.key} style={{ cursor: "pointer" }}>
                  {obj.name}
                </Nav.Link>
              </Nav.Item>
            </>
          );
        })}
      </Nav>

      <Container
        fluid
        className="d-flex justify-content-between p-0 m-0 w-100"
        style={{
          height: "calc(70vh - 56px)",
        }}
      >
        <Container
          className="w-25 border m-0 p-0"
          style={{ overflowY: "auto" }}
        >
          <h3 className="fw-bold">Settin gs</h3>
          {selectedSettings.map((obj, index) => {
            return (
              <div key={index}>
                <h3
                  className="mt-4 mb-2"
                  onClick={() => handleShowObjectSetting(obj.key)}
                  style={{ cursor: "pointer" }}
                >
                  {obj.name}
                </h3>
                {selectedSettingKeys.includes(obj.key) && (
                  <ul>
                    {Object.entries(obj.values).map(([subKey, value]) => (
                      <li key={subKey}>{`${subKey}: ${JSON.stringify(
                        value
                      )}`}</li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </Container>
        <Container
          className="w-60 border m-0 p-0"
          style={{ overflowY: "auto" }}
        ></Container>

        <Container
          className="w-25 border m-0 p-0"
          style={{ overflowY: "auto" }}
        >
          <h3 className="fw-bold">Required Pieces</h3>

          {selectedItems.map((itemObj) => {
            return (
              <div key={itemObj.key}>
                <h3
                  className="mt-4 mb-2"
                  onClick={() => handleShowItemSetting(itemObj.key)}
                  style={{ cursor: "pointer" }}
                >
                  {itemObj.name}
                </h3>
                {selectedItemKeys.includes(itemObj.key) && (
                  <ul>
                    {Object.entries(itemObj.items).map(([subKey, item]) => (
                      <li key={subKey}>
                        {`Item ${subKey}: ${JSON.stringify(item)}`}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </Container>
      </Container>

      {
        ////////////////////////////////
      }
      {/**       <Container className="d-flex align-content-center ">
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
        <Button
          variant="primary"
          onClick={() => setShowColorSelector(true)}
          className="me-3"
        >
          Add Color
        </Button>
        <Button className="" onClick={() => setShowColors(!showColors)}>
          Saved Colors
        </Button>
      </Container>
      {showColorSelector && (
        <ColorSelector
          show={showColorSelector}
          handleClose={() => {
            closeSelector();
          }} // vagy bármelyik másik kategória
        />
      )}
      <Container></Container>
      {showColors && (
        <Container className="colors">
          <h2 className="fw-bold"> Colors</h2>
          <h2 className="fw-bold">Saved Colors</h2>
          <div className="color-row">
            {colors.colors.saved.length > 0 &&
              colors.colors.saved.map((color, index) => (
                <div
                  key={index}
                  className="color-box"
                  style={{
                    backgroundColor: color,
                    height: "5rem",
                    cursor: "pointer",
                    width: "5rem",
                  }}
                >
                  <span>{color}</span>
                </div>
              ))}
          </div>
          <h2 className="fw-bold">Door Colors</h2>
          <div className="color-row text-center">
            {colors.colors.door.length > 0 &&
              colors.colors.door.map((color, index) => (
                <div
                  key={index}
                  className="color-box"
                  style={{
                    backgroundColor: color,
                    height: "5rem",
                    cursor: "pointer",
                    width: "5rem",
                  }}
                >
                  <span>{color}</span>
                </div>
              ))}
          </div>
          <h2 className="fw-bold mt-4">Side Colors</h2>
          <div className="color-row text-center">
            {colors.colors.side.length > 0 &&
              colors.colors.side.map((color, index) => (
                <div
                  key={index}
                  className="color-box"
                  style={{
                    backgroundColor: color,
                    height: "5rem",
                    cursor: "pointer",
                    width: "5rem",
                  }}
                >
                  <span>{color}</span>
                </div>
              ))}
          </div>

          <h2 className="fw-bold mt-4">Countertop Colors</h2>
          <div className="color-row text-center">
            {colors.colors.countertop.length > 0 &&
              colors.colors.countertop.map((color, index) => (
                <div
                  key={index}
                  className="color-box"
                  style={{
                    backgroundColor: color,
                    height: "5rem",
                    cursor: "pointer",
                    width: "5rem",
                  }}
                >
                  <span>{color}</span>
                </div>
              ))}
          </div>
        </Container>
      )}
      <Container className="w-100 mt-4 p-0">
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
        </Container>

        <Container className="d-flex p-0 justify-content-between ">
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
          </Container>
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
      */}
    </>
  );
}

export default NewWork;
