//EditWork.js
// is used for editing a work, as adding, deleting, modifying objects and settings for a work

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button, Container, Dropdown, Nav, Form } from "react-bootstrap";
import ScriptCaller from "../../calculation/scriptCaller";
import store from "../../data/store/store";
import Item from "../helpers/item.js";
import ModelViewer from "../../model/ModelViewer";
import {
  getAllWorks,
  getAllObjects,
  getObjectById,
  getCreatedItemsByObject,
  getSettingById,
} from "../../data/getters";
import {
  selectObject,
  updateObject,
} from "../../data/store/actions/objectStoreFunctions";
import { addWork } from "../../data/store/actions/workStoreFunctions";
import objectApi from "../../data/api/objectApi";
import { useParams } from "react-router-dom";
import { Modal } from "react-bootstrap";

function EditWork({ closeNewWork, clientId }) {
  const dispatch = useDispatch();

  const { workId } = useParams();
  const [showColorSelector, setShowColorSelector] = useState(false); // State for ColorSelector
  const [loading, setLoading] = useState(true);
  const [showColors, setShowColors] = useState(false);
  const [selectedTab, setSelectedTab] = useState("0");
  const [showForm, setShowForm] = useState(false);
  const [showModel, setShowModel] = useState(true);
  const [objects, setObjects] = useState(getAllObjects());
  const [itemDetails, setItemDetails] = useState([]);
  const [settingDetails, setSettingDetails] = useState([]);
  const [modifiedObject, setModifiedObject] = useState(null);
  const [currentObject, setCurrentObject] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [objectToDelete, setObjectToDelete] = useState(null);

  let newObjKey = 999;

  // the settings are in a string, and this function creats a map, list or smth like that from them
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

  // here we can change between the objects and this handles the change between them
  // the newObject tab is for creating a new object
  // the 0 is for showing every objects for the work
  // any other is for shoving a specific object
  useEffect(() => {
    setShowModel(false);

    if (selectedTab == 0) {
      setCurrentObject(objects);
    } else {
      const choosenObject = objects.find(
        (object) => object.objectId == selectedTab
      );
      setCurrentObject([choosenObject]);
    }
    if (selectedTab != "newObject") {
      setTimeout(() => {
        setShowModel(true);
      }, 0);
    }
  }, [selectedTab]);

  // this function handles which objects items should be visible, which is open
  function itemDetailing(objectId) {
    console.log(objectId);
    let newDetails = [...itemDetails];
    if (newDetails.includes(objectId)) {
      newDetails = newDetails.filter((id) => id !== objectId);
    } else {
      if (selectedTab != "newObject") {
        newDetails.push(objectId);
      } else {
        newDetails = [];
      }
    }
    setItemDetails(newDetails);
  }

  // this function handles which objects settings should be visible, which is open
  function settingDetailing(objectId) {
    let newDetails = [...settingDetails];
    if (newDetails.includes(objectId)) {
      newDetails = newDetails.filter((id) => id !== objectId);
    } else {
      if (selectedTab != "newObject") {
        newDetails.push(objectId);
      } else {
        newDetails = [];
      }
    }
    setSettingDetails(newDetails);
  }

  // this loads the from the store
  useEffect(() => {
    if (!loading) {
      setObjects(dispatch(getAllObjects()));
    }
  }, [loading]);

  const colors = useSelector((state) => state.colors);

  function closeSelector() {
    setShowColorSelector(false);
  }

  // this handles the selected tab, so this sets the main variables for them
  function handleSelectedTab(key) {
    if (key !== selectedTab) {
      setSelectedTab(key);
      dispatch(selectObject(key));
    }
  }

  // save all the modify of an object
  function saveModify(object) {
    const objs = objects.map((obj) => (obj.key === object.key ? object : obj));
    setObjects(objs);
    dispatch(updateObject(object));
  }

  //if we modify an item, here we are saving it,
  //I do not thin is alright right not TODO
  function handleModifiedItem(modifiedItem, objectID) {
    let object;
    if (objectID) {
      object = objects.find((obj) => obj.key === objectID);
      if (object) {
        let modifiedItems = object.items.map((item) =>
          item.itemKey === modifiedItem.itemKey ? modifiedItem : item
        );
        const updatedObject = {
          ...object,
          items: modifiedItems,
        };
        saveModify(updatedObject);
      }
    }
  }

  // this is triggered at every change on an item
  const handleItemChange = (modifiedItem, objectID) => {
    handleModifiedItem(modifiedItem, objectID);
  };

  // this is for setting up the initial state after creating a new object
  const init = () => {
    setShowForm(false);
    setShowModel(true);
    setObjects(dispatch(getAllObjects()));
    setSelectedTab("0");
  };

  // TODO I do not think is alright
  const handleSaveWork = async () => {
    const client = await dispatch(getObjectById(clientId));

    // Lekérjük a mai dátumot és formázzuk yyyy-mm-dd formátumra
    const today = new Date();
    const year = today.getFullYear();
    let month = today.getMonth() + 1;
    month = month < 10 ? `0${month}` : month;
    let day = today.getDate();
    day = day < 10 ? `0${day}` : day;
    const currentDate = `${year}-${month}-${day}`;

    // Generálunk két véletlenszerű egész számot a Price és Paid mezőknek
    const price = Math.floor(Math.random() * 1000);
    const paid = Math.floor(Math.random() * price); // Paid-nek kisebbnek kell lennie, mint a Price

    // Elkészítjük az új munka objektumot
    const newWork = {
      ClientId: clientId,
      Client: client.Name, // Például csak az ügyfél nevét vesszük fel
      Date: currentDate,
      Status: "Pending",
      Price: price,
      Paid: paid,
    };

    // Adjuk hozzá az új munkát a store-hoz
    dispatch(addWork(newWork));

    // Bezárjuk az új munka felvételét kezelő dialógust
    closeNewWork();
  };

  // this is the first step of deleting an object
  const handleDeleteObject = (objectId) => {
    setObjectToDelete(objectId);
    setShowDeleteModal(true);
  };

  // after confirming the deletion of work then firstly the generated items must be deleted
  // after the pervious step the object could be deleted
  const confirmDeleteObject = async () => {
    if (objectToDelete !== null) {
      await dispatch(objectApi.deleteObjectApi(objectToDelete));
      const newObjectList = dispatch(getAllObjects());
      setObjects(newObjectList);
      handleSelectedTab("0");
      setShowDeleteModal(false);
      setObjectToDelete(null);
      setCurrentObject(newObjectList);
    }
  };

  return (
    <div className=" mt-0">
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
            Full modell
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
          height: "calc(90vh)",
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
          {showModel && <ModelViewer objectId={selectedTab} />}

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
