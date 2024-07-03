//newWork.js
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button, Container, Dropdown, Nav, Form } from "react-bootstrap";
import ScriptCaller from "../../calculation/scriptCaller";
import store from "../../data/store/store";
import Item from "../helpers/item";
import ModelViewer from "../../model/ModelViewer";
import {
  getSelectedObject,
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

  function parseSetting(setting) {
    if (!setting) {
      return {};
    }

    const parsedSettings = {};
    const pairs = setting.split(",");

    pairs.forEach((pair) => {
      const [key, value] = pair.split(":");
      if (key && value) {
        parsedSettings[key.trim()] = parseInt(value.trim(), 10); // Fontos: alapértelmezett számrendszer (10)
      }
    });

    return parsedSettings;
  }

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

  useEffect(() => {
    if (!loading) {
      setObjects(dispatch(getAllObjects()));
    }
  }, [loading]);

  store.subscribe(() => {
    //console.log("State changed:", store.getState());
    setLoading(store.getState().objectLoading);
  });

  const addNewObject = async (object, generatedItems) => {
    console.log("adding the object to the backend");
    objectApi.createObjectApi(object);
  };

  const colors = useSelector((state) => state.colors);

  function closeSelector() {
    setShowColorSelector(false);
  }

  function handleSelectedTab(key) {
    if (key !== selectedTab) {
      setSelectedTab(key);
      dispatch(selectObject(key));
    }
  }

  function saveModify(object) {
    const objs = objects.map((obj) => (obj.key === object.key ? object : obj));
    setObjects(objs);
    dispatch(updateObject(object));
  }

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

  const handleItemChange = (modifiedItem, objectID) => {
    handleModifiedItem(modifiedItem, objectID);
  };

  const handleSave = () => {
    if (modifiedObject) {
      setModifiedObject(null);
    }
  };
  const handleCreateObject = () => {
    setShowForm(false);
    setShowModel(true);
    dispatch(selectObject("0")); // Válasszuk ki a "0"-s fület a Nav-ban
    setObjects(dispatch(getAllObjects())); // Ez csak egy megjegyzés, hogy itt dispatch(getAllObjects) hívás nincs zárójelben, ami azt jelenti, hogy dispatch(getAllObjects) lesz a setObjects új értéke
    setSelectedTab("0"); // Állítsuk be a kiválasztott fület "0"-ra
  };

  const handleSaveWork = async () => {
    // Lekérjük az ügyfél adatait
    const client = await dispatch(getObjectById(clientId));

    // Lekérjük az összes munkát a store-ból
    const works = await dispatch(getAllWorks());

    // Generáljuk a workId-t: kiválasztjuk a legnagyobb workId-t, majd hozzáadunk egyet
    const maxWorkId = Math.max(...works.map((work) => work.workId));
    const newWorkId = maxWorkId + 1;

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
      workId: newWorkId,
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

  const handleDeleteObject = (objectId) => {
    setObjectToDelete(objectId);
    setShowDeleteModal(true);
  };

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
            <ScriptCaller
              newObjectKey={newObjKey}
              onSave={handleCreateObject}
            />
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
