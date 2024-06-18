import React, { useState, useEffect } from "react";
import { Container, Form, Button } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import processScript from "./itemGenerator/processScript";
import Item from "../reusable/item";
import { getScripts } from "../data/api/apiService";
import {
  getAllObjects,
  getAllScripts,
  getSelectedClient,
} from "../data/getters";
import { fetchScriptItemsForScript } from "../reusable/managers/storeManager";
import { clearSelectedScriptItems } from "../data/store/actions/scriptStoreFunctions";
import { getSelectedWork } from "../data/store/actions/workStoreFunctions";
export default function ScriptCaller({ addNewObjectFunction }) {
  const dispatch = useDispatch();
  const [selectedScript, setSelectedScript] = useState(null);
  const [showScripts, setShowScripts] = useState([]);
  const [currentConfig, setCurrentConfig] = useState([]);
  const scripts = dispatch(getAllScripts());
  const [measurements, setMeasurements] = useState({
    height: "",
    width: "",
    depth: "",
  });
  const [results, setResults] = useState([]);
  const [showWarning, setShowWarning] = useState(false);

  const maxKey = 26;

  const newObjectKey = maxKey + 1;

  const getRoomsWithScripts = () => {
    const roomsWithScripts = [];
    if (scripts) {
      scripts.forEach((script) => {
        if (script.room) {
          if (!roomsWithScripts.includes(script.room)) {
            if (script.room !== "All") {
              roomsWithScripts.push(script.room);
            }
          }
        }
      });

      return roomsWithScripts;
    }
  };

  const roomsWithScripts = getRoomsWithScripts();

  useEffect(() => {
    if (showWarning) {
      const timer = setTimeout(() => {
        setShowWarning(false);
      }, 5000);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [showWarning]);

  function selectScript(script) {
    if (
      measurements &&
      measurements.height > 0 &&
      measurements.height &&
      measurements.width > 0 &&
      measurements.width &&
      measurements.depth > 0 &&
      measurements.depth
    ) {
      setCurrentConfig(script);
      setSelectedScript(script);
      fetchScriptItemsForScript(script.scriptId);
      console.log(measurements);
    } else {
      setShowWarning(true);
    }
  }
  function handleGenerate() {
    if (selectedScript && measurements) {
      const generatedItems = [];
      /* const thickness = 18;
      const updatedScript = {
        ...selectedScript,
        config: currentConfig,
      };

      console.log(updatedScript);
      setSelectedScript(updatedScript);*/
      /*
      const result = processScript(updatedScript, measurements, thickness);
      console.log("Generated result:", result);
      setResults(result);*/
      const client = dispatch(getSelectedWork());
      console.log(client);
      const object = {
        name: selectedScript.name,
        client: dispatch(getSelectedClient()),
        work: dispatch(getSelectedWork()),
        usedScript: selectScript.scriptId,
        usedColors: ["red", "blue"],
        //        size: "[0,0,0]",
        //      position: "[0,0,0]",
        //    rotation: "[0,0,0]",
      };
      console.log(object);
      //      addNewObjectFunction(object, generatedItems);
    } else {
      console.error("Invalid configuration or selected script.");
    }
  }

  const handleShowScripts = (index) => {
    if (!showScripts.includes(index)) {
      setShowScripts([...showScripts, index]);
    } else {
      const updatedScripts = [...showScripts];
      updatedScripts.splice(index, 1);
      setShowScripts(updatedScripts);
    }
  };
  function handleBack() {
    setCurrentConfig(null);
    setSelectedScript(null);
    dispatch(clearSelectedScriptItems());
  }

  function handleConfigChange(event) {
    const { name, value } = event.target;
    setCurrentConfig((prevConfig) => ({
      ...prevConfig,
      [name]: value,
    }));

    if (name === "height" || name === "width" || name === "depth") {
      setMeasurements((prevMeasurements) => ({
        ...prevMeasurements,
        [name]: parseFloat(value),
      }));
    }
  }

  return (
    <>
      {!selectedScript ? (
        <Container className="mt-4">
          <Container fluid className="mt-4">
            <Form className="d-flex ">
              <Form.Group className="me-3">
                <Form.Label>Height</Form.Label>
                <Form.Control
                  type="number"
                  name="height"
                  value={measurements.height}
                  placeholder="Enter height"
                  onChange={handleConfigChange}
                />
              </Form.Group>

              <Form.Group className="me-3">
                <Form.Label>Width</Form.Label>
                <Form.Control
                  type="number"
                  name="width"
                  value={measurements.width}
                  placeholder="Enter width"
                  onChange={handleConfigChange}
                />
              </Form.Group>

              <Form.Group className="me-3">
                <Form.Label>Depth</Form.Label>
                <Form.Control
                  type="number"
                  name="depth"
                  value={measurements.depth}
                  placeholder="Enter depth"
                  onChange={handleConfigChange}
                />
              </Form.Group>
            </Form>
            {showWarning && (
              <div className="alert alert-danger mt-2" role="alert">
                Please fill all the input fields.
              </div>
            )}
          </Container>

          <h3 className="fw-bold">Script Selector</h3>
          <div className="">
            {roomsWithScripts &&
              roomsWithScripts.map((room, index) => (
                <div
                  key={index}
                  className="d-flex align-content-center m-auto mb-2"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleShowScripts(room)}
                >
                  <p
                    className="align-content-center fs-4 me-3"
                    style={{ width: "10rem" }}
                  >
                    {room}
                  </p>
                  <div className="scripts d-flex flex-nowrap overflow-x-scroll">
                    {scripts
                      .filter(
                        (script) =>
                          script.room === room || script.room === "All"
                      )
                      .map((script) => (
                        <div
                          key={`${room}_${script.scriptId}`}
                          className="me-3"
                          onClick={() => selectScript(script)}
                        >
                          <div
                            className="border rounded text-center"
                            style={{ width: "5rem", height: "5rem" }}
                          ></div>
                          <p>{script.name}</p>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
          </div>
        </Container>
      ) : (
        <div className="mt-4 d-flex justify-content-evenly">
          <div className="border w-50">
            <h3 className="fw-bold">{selectedScript.name} Settings</h3>
            <Form className="mt-3">
              {Object.entries(currentConfig).map(([key, value], idx) => (
                <Form.Group key={idx} className="mb-3  d-flex ">
                  <Form.Label
                    className="border-0 ps-3 align-content-center"
                    style={{ width: "11rem" }}
                  >
                    {key}
                  </Form.Label>
                  <Form.Control
                    className="border-0 text-center ms-2 align-content-center"
                    style={{ width: "5rem" }}
                    type="text"
                    name={key}
                    value={value}
                    onChange={handleConfigChange}
                  />
                </Form.Group>
              ))}
            </Form>
          </div>

          {/**Results */}
          <Container
            fluid
            className="w-50 border d-flex justify-content-center p-1"
          >
            <div>
              <div className="button-box">
                <Button
                  variant="secondary"
                  className="m-1"
                  onClick={handleBack}
                >
                  Back
                </Button>
                <Button
                  variant="primary"
                  className="m-1"
                  onClick={handleGenerate}
                >
                  Generate
                </Button>
                <Button
                  variant="success"
                  className="m-1"
                  onClick={handleGenerate}
                >
                  Save
                </Button>
              </div>
              <h3 className="fw-bold text-center">Results</h3>
              {results.resultItems &&
                results.resultItems.map((result, index) => {
                  return <Item key={result.key || index} Item={result} />;
                })}
            </div>
          </Container>
        </div>
      )}
    </>
  );
}
