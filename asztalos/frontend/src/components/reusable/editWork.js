//newWork.js
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button, Container, Dropdown, Nav, Form } from "react-bootstrap";
import ColorSelector from "./colorSelector"; // Importing ColorSelector
import store from "../data/store/store";
import Item from "./item";
import ScriptCaller from "../calculation/scriptCaller";
import ModelViewer from "../model/ModelViewer";
import {
  getSelectedObject,
  getAllWorks,
  getAllObjects,
  getObjectById,
  getCreatedItemsByWork,
  getCreatedItemsByObject,
} from "../data/getters";
import {
  selectObject,
  updateObject,
  addObject,
} from "../data/store/actions/objectStoreFunctions";
import { addWork } from "../data/store/actions/workStoreFunctions";
import objectApi from "../data/api/objectApi";
import { useParams } from "react-router-dom";
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
  let newObjKey = 999;

  useEffect(() => {
    if (selectedTab == 0) {
      setCurrentObject(objects);
    } else {
      const choosenObject = objects.find(
        (object) => object.objectId == selectedTab
      );
      setCurrentObject([choosenObject]);
    }
  }, [selectedTab]);

  function itemDetailing(objectId) {
    let newDetails = [...itemDetails];
    if (newDetails.includes(objectId)) {
      newDetails = newDetails.filter((id) => id !== objectId);
    } else {
      newDetails.push(objectId);
    }
    setItemDetails(newDetails);
  }

  function settingDetailing(objectId) {
    let newDetails = [...settingDetails];
    if (newDetails.includes(objectId)) {
      newDetails = newDetails.filter((id) => id !== objectId);
    } else {
      newDetails.push(objectId);
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
  const handleRegenerate = () => {
    // Implementáld az újragenerálás logikáját
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

  return (
    <>
      <Nav
        key="nav"
        className="pt-5"
        variant="tabs"
        defaultActiveKey="0"
        onSelect={(selectedKey) => {
          handleSelectedTab(selectedKey);
        }}
      >
        <Nav.Item key={"10000"}>
          <Nav.Link
            eventKey="newObject"
            onClick={() => {
              setShowModel(false);
              if (!showForm) {
                setShowForm(true);
              }
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
              setShowModel(true);
            }}
          >
            New Object
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
                    setShowModel(true);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  {obj.objectId}
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
          //          height: "calc(70vh - 56px)",
          height: "100vh",
        }}
        key="mainNewWorkBox"
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
            })}

          {/*selectedSettings &&
            selectedSettings.map((obj) => {
              return (
                <div key={obj.key}>
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
            })*/}
        </Container>
        <Container
          className="w-60 border m-0 p-0"
          style={{ overflowY: "auto" }}
          key="middleNewWorkBox"
        >
          {/*showModel && <ModelViewer />*/}
          {!showModel && showForm && (
            <ScriptCaller
              newObjectKey={newObjKey}
              addNewObjectFunction={addNewObject}
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
            })}
        </Container>
      </Container>
    </>
  );
}

export default EditWork;
