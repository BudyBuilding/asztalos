//newWork.js
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button, Container, Dropdown, Nav, Form } from "react-bootstrap";
import FurnitureItem from "./furnitureItem";
import ColorSelector from "./colorSelector"; // Importing ColorSelector
import store from "../data/store/store";
import processScript from "../calculation/itemGenerator/processScript";
import Item from "./item";
import { loadScripts } from "../calculation/script/manageScript";
import ScriptCaller from "../calculation/scriptCaller";
import ModelViewer from "../model/ModelViewer";
import {
  selectingObject,
  modifyObject,
  getWorks,
} from "../data/firebase/apiService";
import addallobjects from "./objectManager";

function NewWork({ closeNewWork, clientId }) {
  const [types, setTypes] = useState(["Kitchen", "Living Room", "Wardrobe"]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [showColorSelector, setShowColorSelector] = useState(false); // State for ColorSelector
  const [showColors, setShowColors] = useState(false);
  const [selectedSettingKeys, setSelectedSettingKeys] = useState([]);
  const [selectedTab, setSelectedTab] = useState("0");
  const [showForm, setShowForm] = useState(false);
  const [selectedScript, setSelectedScript] = useState(null);
  const [selectedItemKeys, setSelectedItemKeys] = useState([]);
  const [showModel, setShowModel] = useState(true);
  const [objects, setObjects] = useState(useSelector((state) => state.objects));
  const [selectedSettings, setSelectedSettings] = useState(objects);
  const [selectedItems, setSelectedItems] = useState(null);
  const [modifiedObject, setModifiedObject] = useState(null);
  let newObjKey = 999;

  useEffect(() => {
    selectingObject("0");
  }, []);

  useEffect(() => {
    if (selectedTab === "0") {
      let settings = [];
      let items = [];
      objects.forEach((object) => {
        settings.push({
          name: object.name,
          key: object.key,
          values: object.values,
        });
        items.push(object);
      });
      setSelectedSettings(settings);
      setSelectedItems(items);
    } else {
      const selectedObject = objects.find(
        (obj) => obj.key === parseInt(selectedTab)
      );
      if (selectedObject) {
        setSelectedSettings([
          {
            name: selectedObject.name,
            key: selectedObject.key,
            values: selectedObject.values,
            items: selectedObject.items,
          },
        ]);
        setSelectedItems([
          {
            name: selectedObject.name,
            key: selectedObject.key,
            items: selectedObject.items,
            values: selectedObject.values,
          },
        ]);
      }
    }
  }, [objects, selectedTab]);

  store.subscribe(() => {
    //console.log("State changed:", store.getState());
  });
  function handleShowObjectSetting(key) {
    let showedSettings = [...selectedSettingKeys];
    if (showedSettings.includes(key)) {
      showedSettings = showedSettings.filter((k) => k !== key);
    } else {
      showedSettings.push(key);
    }
    setSelectedSettingKeys(showedSettings);
  }

  function handleShowItemSetting(key) {
    let showedItems = [...selectedItemKeys];
    if (showedItems.includes(key)) {
      showedItems = showedItems.filter((k) => k !== key);
    } else {
      showedItems.push(key);
    }
    setSelectedItemKeys(showedItems);
  }
  function addNewObject(object) {
    // Ellenőrizzük, hogy az új objektum már szerepel-e az állapotban
    if (!objects.some((obj) => obj.key === object.key)) {
      console.log(object);
      //  setObjects([...objects, object]);
      //store.dispatch(addObject(object));
    } else {
      console.warn("Az objektum már szerepel az állapotban:", object);
    }
  }

  useEffect(() => {
    if (selectedTab === "0") {
      let settings = [];
      let items = [];
      objects.forEach((object) => {
        settings.push({
          name: object.name,
          key: object.key,
          values: object.values, // Fixed typo here from 'vlaues' to 'values'
        });
        items.push({
          name: object.name,
          key: object.key,
          items: object.items,
        });
      });
      setSelectedSettings(settings);
      setSelectedItems(items);
    } else {
      // Ha egy specifikus elemet választottak, csak azt jelenítjük meg
      const selectedObject = objects.find(
        (obj) => obj.key === parseInt(selectedTab)
      );
      //      console.log(selectedObject);
      if (selectedObject) {
        setSelectedSettings([
          {
            name: selectedObject.name,
            key: selectedObject.key,
            items: selectedObject.items,
            values: selectedObject.values,
          },
        ]);
        setSelectedItems([
          {
            name: selectedObject.name,
            key: selectedObject.key,
            values: selectedObject.values,
            items: selectedObject.items,
          },
        ]);
      }
    }
  }, [selectedTab]);

  const colors = useSelector((state) => state.colors);
  const dispatch = useDispatch();

  function closeSelector() {
    setShowColorSelector(false);
  }

  useEffect(() => {
    dispatch({ type: "LOAD_COLORS" });
  }, [dispatch]);

  function handleSelectedTab(key) {
    if (key !== selectedTab) {
      setSelectedTab(key);
      selectingObject(key);
      setSelectedItemKeys([]);
    }
  }

  function saveModify(object) {
    const objs = objects.map((obj) => (obj.key === object.key ? object : obj));
    setObjects(objs);
    dispatch(modifyObject(object));
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

  function handleSaveWork() {
    closeNewWork();
  }

  return (
    <>
      <Nav
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
              setSelectedItems([]);
              setSelectedSettings([]);
              if (!showForm) {
                setShowForm(true);
              }
            }}
          >
            New Object
          </Nav.Link>
        </Nav.Item>

        {objects.map((obj) => {
          return (
            <Nav.Item key={obj.key}>
              <Nav.Link
                eventKey={obj.key}
                onClick={() => {
                  if (showForm) {
                    setShowForm(false);
                  }
                  setShowModel(true);
                }}
                style={{ cursor: "pointer" }}
              >
                {obj.name}
              </Nav.Link>
            </Nav.Item>
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
          fluid
          className="w-25 border m-0 p-0"
          style={{ overflowY: "auto" }}
        >
          <h3 className="fw-bold">Settings</h3>
          {selectedSettings &&
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
            })}
        </Container>
        <Container
          className="w-60 border m-0 p-0"
          style={{ overflowY: "auto" }}
        >
          {showModel && <ModelViewer />}
          {!showModel && showForm && (
            <ScriptCaller newObjectKey={newObjKey} newObject={addNewObject} />
          )}
        </Container>
        <Container
          fluid
          className="w-25 border m-0 p-0"
          style={{ overflowY: "auto" }}
        >
          <h3 className="fw-bold">Required Pieces</h3>

          {selectedItems &&
            selectedItems.map((itemObj) => {
              return (
                <div key={itemObj.key}>
                  <h3
                    className="mt-4 mb-2"
                    onClick={() => handleShowItemSetting(itemObj.key)}
                    style={{ cursor: "pointer" }}
                  >
                    {itemObj.name}
                  </h3>
                  {selectedItemKeys &&
                    selectedItemKeys.includes(itemObj.key) && (
                      <div>
                        {itemObj.items.map((item) => {
                          return (
                            <div key={item.itemKey}>
                              <Item
                                objectID={itemObj.key}
                                key={item.itemKey}
                                Item={item}
                                onItemChange={handleItemChange}
                              />
                            </div>
                          );
                        })}
                        <Button
                          variant="primary"
                          className="me-2 ms-2"
                          onClick={handleSave}
                        >
                          Save
                        </Button>
                        <Button variant="secondary" onClick={handleRegenerate}>
                          Regenerate
                        </Button>
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

export default NewWork;
