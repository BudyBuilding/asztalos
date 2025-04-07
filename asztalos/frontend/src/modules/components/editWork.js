// EditWork.js
import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Container, Nav } from "react-bootstrap";
import ScriptCaller from "../../calculation/scriptCaller";
import Item from "../helpers/item.js";
import ModelViewer from "../../model/ModelViewer.js";
import {
  getAllObjects,
  getObjectById,
  getCreatedItemsByObject,
  getSettingById,
  getClientById
} from "../../data/getters";
import {
  selectObject,
  updateObject
} from "../../data/store/actions/objectStoreFunctions";
import { updateWork } from "../../data/store/actions/workStoreFunctions";
import objectApi from "../../data/api/objectApi";
import { Modal } from "react-bootstrap";
import ObjectViewer from "../../model/ObjectViewer.js";
import { useParams } from "react-router-dom";

function EditWork() {
  const dispatch = useDispatch();
  const works = useSelector(state => state.works);
  const { workId } = useParams();
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("0");
  const [showForm, setShowForm] = useState(false);
  const [showModel, setShowModel] = useState(true);
  const [objects, setObjects] = useState([]);
  const [itemDetails, setItemDetails] = useState([]);
  const [settingDetails, setSettingDetails] = useState([]);
  const [currentObject, setCurrentObject] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [objectToDelete, setObjectToDelete] = useState(null);
  const [localWork, setLocalWork] = useState(null);

  let newObjKey = 999;

  // Görgetés letiltása a body-n
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // Lokális work létrehozása az oldal betöltésekor
  useEffect(() => {
    const createLocalWorkFromExisting = async () => {
      const originalWork = works.find(work => work.workId === parseInt(workId, 10));
      if (!originalWork) {
        console.error("Work not found with ID:", workId);
        setLoading(false);
        return;
      }

      const clientData = await dispatch(getClientById(originalWork.ClientId));
      const today = new Date();
      const year = today.getFullYear();
      let month = today.getMonth() + 1;
      month = month < 10 ? `0${month}` : month;
      let day = today.getDate();
      day = day < 10 ? `0${day}` : day;
      const currentDate = `${year}-${month}-${day}`;

      const newWork = {
        ...originalWork,
        Date: currentDate,
        Status: "Pending",
        objects: originalWork.objects ? [...originalWork.objects] : [],
      };

      console.log("Created local work:", newWork);
      setLocalWork(newWork);
      setLoading(false);
    };

    if (works.length > 0) {
      createLocalWorkFromExisting();
    }
  }, [dispatch, workId, works]);

  // Objectek betöltése
  useEffect(() => {
    const fetchObjects = async () => {
      const allObjects = await dispatch(getAllObjects());
      setObjects(allObjects);
    };

    if (!loading) {
      fetchObjects();
    }
  }, [loading, dispatch]);

  // Parse settings string into an object
  function parseSetting(setting) {
    if (!setting) {
      return {};
    }

    const parsedSettings = {};
    const pairs = setting.split(",");

    pairs.forEach((pair) => {
      const [key, value] = pair.split(":");
      if (key && value) {
        parsedSettings[key.trim()] = parseInt(value.trim(), 10);
      }
    });

    return parsedSettings;
  }

  // Handle tab change
  useEffect(() => {
    setShowModel(false);

    if (selectedTab === "0") {
      setCurrentObject(objects);
    } else {
      const choosenObject = objects.find(
        (object) => object.objectId === selectedTab
      );
      setCurrentObject([choosenObject]);
    }
    if (selectedTab !== "newObject") {
      setTimeout(() => {
        setShowModel(true);
      }, 0);
    }
  }, [selectedTab, objects]);

  // Handle item detailing visibility
  function itemDetailing(objectId) {
    let newDetails = [...itemDetails];
    if (newDetails.includes(objectId)) {
      newDetails = newDetails.filter((id) => id !== objectId);
    } else {
      if (selectedTab !== "newObject") {
        newDetails.push(objectId);
      } else {
        newDetails = [];
      }
    }
    setItemDetails(newDetails);
  }

  // Handle setting detailing visibility
  function settingDetailing(objectId) {
    let newDetails = [...settingDetails];
    if (newDetails.includes(objectId)) {
      newDetails = newDetails.filter((id) => id !== objectId);
    } else {
      if (selectedTab !== "newObject") {
        newDetails.push(objectId);
      } else {
        newDetails = [];
      }
    }
    setSettingDetails(newDetails);
  }

  // Handle tab selection
  function handleSelectedTab(key) {
    if (key !== selectedTab) {
      setSelectedTab(key);
      dispatch(selectObject(key));
    }
  }

  // Save modifications to an object and update the local work
  const saveModify = useCallback((object) => {
    const updatedObjects = objects.map((obj) => (obj.objectId === object.objectId ? object : obj));
    setObjects(updatedObjects);
    dispatch(updateObject(object));

    if (localWork) {
      const updatedWork = {
        ...localWork,
        objects: updatedObjects.filter(obj => obj.workId === localWork.workId),
      };
      console.log("Updating local work with objects:", updatedWork);
      setLocalWork(updatedWork);
    }
  }, [objects, localWork, dispatch]);

  // Handle modified item
  function handleModifiedItem(modifiedItem, objectId) {
    const object = objects.find((obj) => obj.objectId === objectId);
    if (object) {
      let modifiedItems = dispatch(getCreatedItemsByObject(objectId)).map((item) =>
        item.itemId === modifiedItem.itemId ? modifiedItem : item
      );
      const updatedObject = {
        ...object,
        items: modifiedItems
      };
      saveModify(updatedObject);
    }
  }

  // Handle item change
  const handleItemChange = (modifiedItem, objectId) => {
    handleModifiedItem(modifiedItem, objectId);
  };

  // Initialize state after creating a new object
  const init = () => {
    setShowForm(false);
    setShowModel(true);
    setObjects(dispatch(getAllObjects()));
    setSelectedTab("0");
  };

  // Handle saving the work to the store and closing the page
  const handleSaveWork = () => {
    if (localWork) {
      console.log("Saving work to store:", localWork);
      dispatch(updateWork(localWork));
      window.history.back();
    }
  };

  // Handle delete object
  const handleDeleteObject = (objectId) => {
    setObjectToDelete(objectId);
    setShowDeleteModal(true);
  };

  // Confirm delete object
  const confirmDeleteObject = async () => {
    if (objectToDelete !== null) {
      await dispatch(objectApi.deleteObjectApi(objectToDelete));
      const newObjectList = await dispatch(getAllObjects());
      setObjects(newObjectList);
      handleSelectedTab("0");
      setShowDeleteModal(false);
      setObjectToDelete(null);
      setCurrentObject(newObjectList);

      if (localWork) {
        const updatedWork = {
          ...localWork,
          objects: newObjectList.filter(obj => obj.workId === localWork.workId),
        };
        setLocalWork(updatedWork);
      }
    }
  };

  return (
    <div className="mt-0" style={{ height: "100%", overflow: "hidden" }}>
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this object?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDeleteObject}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      <Nav
        key="nav"
        variant="tabs"
        defaultActiveKey="0"
        onSelect={(selectedKey) => {
          handleSelectedTab(selectedKey);
        }}
      >
        <Nav.Item key={"-1"}>
          <Nav.Link
            eventKey="newObject"
            onClick={() => {
              setShowModel(false);
              setCurrentObject([]);
              setShowForm(true);
            }}
          >
            New Object
          </Nav.Link>
        </Nav.Item>
        <Nav.Item key={"0"}>
          <Nav.Link
            eventKey="0"
            onClick={() => {
              if (showForm) {
                setShowForm(false);
              }
            }}
          >
            Full model
          </Nav.Link>
        </Nav.Item>
        {objects &&
          objects.map((obj) => {
            return (
              <Nav.Item key={obj.objectId}>
                <Nav.Link
                  eventKey={obj.objectId}
                  onClick={() => {
                    if (showForm) {
                      setShowForm(false);
                    }
                  }}
                  style={{ cursor: "pointer" }}
                >
                  {obj.objectId}
                  <Button
                    variant="light"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteObject(obj.objectId);
                    }}
                  >
                    x
                  </Button>
                </Nav.Link>
              </Nav.Item>
            );
          })}
        <Button onClick={handleSaveWork}>Save Work</Button>
      </Nav>
      <Container
        fluid
        className="d-flex justify-content-between p-0 m-0 w-100"
        style={{
          height: "85vh",
          overflowY: "auto"
        }}
      >
        <Container
          fluid
          className="w-25 border m-0 p-0"
          style={{ overflowY: "auto" }}
          key="leftNewWorkBox"
        >
          <h3 className="fw-bold">Settings</h3>
          {currentObject &&
            currentObject.map((object) => {
              if (object) {
                return (
                  <div key={object.objectId}>
                    <h3
                      onClick={() => settingDetailing(object.objectId)}
                      style={{ cursor: "pointer" }}
                    >
                      {object.name}
                    </h3>
                    {settingDetails.includes(object.objectId) && (
                      <div>
                        {Object.entries(parseSetting(object.setting)).map(
                          ([key, value]) => (
                            <div key={key}>
                              <p>
                                {dispatch(getSettingById(key))
                                  ? dispatch(getSettingById(key)).name
                                  : ""}
                                :{value}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                );
              }
            })}
        </Container>
        <Container
          className="w-60 border m-0 p-0"
          style={{ overflowY: "auto" }}
          key="middleNewWorkBox"
        >
          {showModel &&
            (selectedTab === "0" ? (
              <ModelViewer workId={workId} /> // Eredeti workId-t adjuk át
            ) : (
              <ObjectViewer objectId={selectedTab} />
            ))}

          {!showModel && showForm && (
            <ScriptCaller newObjectKey={newObjKey} onSave={init} />
          )}
        </Container>
        <Container
          fluid
          className="w-25 border m-0 p-0"
          style={{ overflowY: "auto" }}
          key="rightNewWorkBox"
        >
          <h3 className="fw-bold">Required Pieces</h3>
          {currentObject &&
            currentObject.map((object) => {
              if (object) {
                return (
                  <div key={object.objectId}>
                    <h3
                      onClick={() => itemDetailing(object.objectId)}
                      style={{ cursor: "pointer" }}
                    >
                      {object.name}
                    </h3>
                    {itemDetails.includes(object.objectId) && (
                      <div>
                        {dispatch(getCreatedItemsByObject(object.objectId)).map(
                          (item) => (
                            <div key={item.itemId}>
                              <Item
                                objectID={object.objectId}
                                key={item.itemId}
                                Item={item}
                                onItemChange={handleItemChange}
                              />
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                );
              }
            })}
        </Container>
      </Container>
    </div>
  );
}

export default EditWork;