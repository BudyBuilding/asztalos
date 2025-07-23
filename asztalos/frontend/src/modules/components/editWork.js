// EditWork.js
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import GeneratedItemsList from "../helpers/GeneratedItemsList.js";
import createdItemApi from "../../data/api/createdItemApi";
import {
  Button,
  Nav,
  NavDropdown,
  Modal,
  Card,
  Row,
  Col,
  Image as RBImage
} from "react-bootstrap";
import { IonIcon } from "@ionic/react";
import { add, chevronBack, chevronForward } from "ionicons/icons";
import ScriptCaller from "../../calculation/scriptCaller";
import ModelViewer from "../../model/ModelViewer.js";
import ObjectViewer from "../../model/ObjectViewer.js";
import { useParams } from "react-router-dom";
import {
  getAllObjects,
  getCreatedItemsByObject,
  getClientById,
  getAllColors,
  getSettingById
} from "../../data/getters";
import { selectObject } from "../../data/store/actions/objectStoreFunctions";
import { updateWork } from "../../data/store/actions/workStoreFunctions";
import objectApi from "../../data/api/objectApi";
import "./editWork.css";

function EditWork() {
  const dispatch = useDispatch();
  const works = useSelector((state) => state.works);
  const { workId } = useParams();

  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("0");
  const [showForm, setShowForm] = useState(false);
  const [showModel, setShowModel] = useState(true);
  const [tablesGenerated, setTablesGenerated] = useState(false);
  const [objects, setObjects] = useState([]);
  /*const [createdItems, setCreatedItems] = useState(
    useSelector((state) => state.createdItems) || []
  );*/
  /*const createdItems =
    useSelector((state) => state.createdItems) || createdItems1 || [];
*/
  const createdItems = useSelector((state) => state.createdItems);

  const [palette, setPalette] = useState([]);
  const [collapsedColors, setCollapsedColors] = useState({});
  const [currentObject, setCurrentObject] = useState([]);
  const [settingDetails, setSettingDetails] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [objectToDelete, setObjectToDelete] = useState(null);
  const [localWork, setLocalWork] = useState(null);
  const [showPaletteModal, setShowPaletteModal] = useState(false);
  const isOrdered = localWork?.isOrdered; //
  const colors = dispatch(useSelector(getAllColors)) || [];

  const startXRef = useRef(0);
  const startWidthRef = useRef(0);
  const [panelWidth, setPanelWidth] = useState(30);
  const [collapsed, setCollapsed] = useState(false);

  // load work and objects
  useEffect(() => {
    const initWork = async () => {
      const orig = works.find((w) => w.workId === +workId);
      console.log("orig: ", orig);
      if (!orig) {
        setLoading(false);
        return;
      }
      await dispatch(getClientById(orig.ClientId));
      const today = new Date();
      setLocalWork({
        ...orig,
        Date: today.toISOString().slice(0, 10),
        Status: "Pending",
        objects: orig.objects || []
      });
      setLoading(false);
    };
    initWork();
  }, [works, workId, dispatch]);

  useEffect(() => {
    if (loading) return;
    const loadObjects = async () => {
      const all = await dispatch(getAllObjects());
      setObjects(all.filter((o) => o.work?.workId === +workId));
    };
    loadObjects();
  }, [loading, workId, dispatch]);

  // EditWork.js, a useEffect(…) után ahol setLocalWork‑ot hívod:
  // (vagy akár közvetlenül a helyén)
  const parseRoom = (roomStr) => {
    if (!roomStr) {
      // ha nincs megadva, akkor a default [2500,5000,5000] mm → [2.5,5,5] m
      return { h: 2.5, w: 5, d: 5 };
    }
    const [hMm, wMm, dMm] = roomStr
      .slice(1, -1)
      .split(",")
      .map((n) => parseFloat(n) || 0);
    // oszd el 1000‐rel, hogy méterben kapd vissza
    return {
      h: hMm / 1000,
      w: wMm / 1000,
      d: dMm / 1000
    };
  };

  const handleRoomChange = (axis, value) => {
    const num = parseFloat(value) || 0;
    const old = parseRoom(localWork.room);
    const next = { ...old, [axis]: num };
    const roomStr = `[${next.h},${next.w},${next.d}]`;
    // 1) frissítsd a helyi stétet
    setLocalWork((w) => ({ ...w, room: roomStr }));
    // 2) küldjed el a backendre
    dispatch(updateWork({ ...localWork, room: roomStr }));
  };

  /*
  // build createdItems from selectedTab
  useEffect(() => {
    const wid = +workId;
    if (selectedTab === "newObject") {
      setCreatedItems([]);
      return;
    }
    let all = [];
    if (selectedTab === "0") {
      objects.forEach((o) => {
        all = all.concat(
          dispatch(getCreatedItemsByObject(o.objectId)).filter(
            (it) => it.work?.workId === wid
          )
        );
      });
    } else {
      const oid = +selectedTab;
      all = dispatch(getCreatedItemsByObject(oid)).filter(
        (it) => it.work?.workId === wid
      );
    }
    setCreatedItems(
      all.map((it) => ({ ...it, colorId: it.color?.colorId ?? null }))
    );
  }, [objects, selectedTab, workId, dispatch]);*/

  useEffect(() => {
    const wid = +workId;

    const loadItems = async () => {
      if (selectedTab === "newObject") {
        //  setCreatedItems([]);
        return;
      }

      try {
        let all = [];
        if (selectedTab === "0") {
          const results = await Promise.all(
            objects.map((o) => dispatch(getCreatedItemsByObject(o.objectId)))
          );
          all = results.flat().filter((it) => it.work?.workId === wid);
        } else {
          const oid = +selectedTab;
          const items = await dispatch(getCreatedItemsByObject(oid));
          all = items.filter((it) => it.work?.workId === wid);
        }
        /*
        setCreatedItems(
          all.map((it) => ({ ...it, colorId: it.color?.colorId ?? null }))
        );*/
      } catch (err) {
        console.error("Failed to load createdItems:", err);
      }
    };

    loadItems();
  }, [objects, selectedTab, workId, dispatch]);

  // update palette on createdItems change

  const PFL_COLOR = useSelector((state) =>
    state.colors.find((c) => c.colorId === -1)
  ) || { colorId: -1, name: "PFL", hex: "#FFFFFF" };

  useEffect(() => {
    // 1) kigyűjtjük, mely színek vannak ténylegesen használatban
    const itemColorIds = Array.from(
      new Set(
        createdItems
          .map((it) => it.colorId)
          .filter((cid) => cid != null && cid !== -1) // a PFL-t külön kezeljük
      )
    );

    // 2) megvan a használt színek tömbje, lekérjük őket a 'colors'-ból
    const usedColors = itemColorIds
      .map((id) => colors.find((c) => c.colorId === id))
      .filter(Boolean);

    // 3) mindig tegyük eléjük a PFL_COLOR-t
    const newPalette = [PFL_COLOR, ...usedColors];

    setPalette(newPalette);
  }, [createdItems, colors]);

  // handle external item changes
  /*  const handleCreatedItemChange = (index, fields) => {
    setCreatedItems((prev) => {
      const arr = [...prev];
      arr[index] = { ...arr[index], ...fields };
      const updated = { ...arr[index], ...fields };
      if (typeof updated.itemId === "number" && updated.itemId > 0) {
        // a backend color-update-hez color objektumot vár
        const payload = {
          ...updated,
          ...(fields.colorId !== undefined && {
            color: fields.colorId === null ? null : { colorId: fields.colorId }
          })
        };
        // ne küldjük fölöslegesen a colorId mezőt is
        delete payload.colorId;

        dispatch(
          createdItemApi.updateCreatedItemApi(updated.itemId, payload)
        ).catch((err) => console.error("Error updating createdItem:", err));
      }
      return arr;
    });
  };*/

  const handleCreatedItemChange = (index, fields) => {
    // közvetlenül a store‑on keresztül updateljük a tételt
    dispatch(
      createdItemApi.updateCreatedItemApi(createdItems[index].itemId, {
        ...createdItems[index],
        ...fields
      })
    ).catch((err) => console.error("Error updating createdItem:", err));
  };

  // ── Új item hozzáadása ───────────────────────────────────
  const handleAddItem = () => {
    if (isOrdered) return;
    // csak ha tényleg egy objektum van kijelölve (selectedTab !== "0" és !== "newObject")
    if (selectedTab !== "0" && selectedTab !== "newObject") {
      const defaultItem = {
        size: "[1,1,18]",
        qty: 1,
        position: "[0,0,0]",
        rotation: "[0,0,0]",
        colorId: null,
        name: "",
        details: "",
        material: "", // anyag
        rotable: true,
        object: { objectId: +selectedTab },
        work: { workId: +workId }, // ← ide kell a munka
        itemId: Date.now() * -1
      };
      //  setCreatedItems((old) => [...old, defaultItem]);
    }
  };

  const handleModelViewerUpdate = (updatedItem, groupIdx) => {
    const idx = createdItems.findIndex(
      (it) => it.itemId === updatedItem.itemId
    );
    if (idx !== -1) {
      handleCreatedItemChange(idx, {
        colorId: updatedItem.colorId,
        position: updatedItem.position,
        rotation: updatedItem.rotation
      });
    }
  };

  const handleObjectUpdate = (updatedObject, objectIndex) => {
    console.log("[EditWork] handleObjectUpdate()", {
      updatedObject,
      objectIndex
    });
    setObjects((prev) => {
      const next = [...prev];
      next[objectIndex] = updatedObject;
      console.log("[EditWork] new objects[]:", next);
      return next;
    });
    dispatch(objectApi.updateObjectApi(updatedObject.objectId, updatedObject))
      .then(() =>
        console.log("[EditWork] API sikeres object update:", updatedObject)
      )
      .catch((err) => console.error("[EditWork] Error updating object:", err));
  };

  const handleObjectViewerUpdate = (updatedItem, groupIdx) => {
    const idx = createdItems.findIndex(
      (it) => it.itemId === updatedItem.itemId
    );
    if (idx !== -1) {
      handleCreatedItemChange(idx, {
        colorId: updatedItem.colorId,
        position: updatedItem.position,
        rotation: updatedItem.rotation
      });
    }
  };

  const handleSelectTab = (key) => {
    setSelectedTab(key);
    dispatch(selectObject(key));
    if (key === "0") {
      setShowForm(false);
      setShowModel(true);
    }
  };
  useEffect(() => {
    if (selectedTab === "0") setShowModel(true);
    else setShowModel(false);
    // and likewise for showForm:
    setShowForm(selectedTab === "newObject");
  }, [selectedTab]);
  const handleSaveWork = async () => {
    if (!localWork) return;
    setLoading(true);
    try {
      // 1) Mentjük az újonnan hozzáadott tételeket (amiknek nincs még érvényes itemId-jük)
      const unsaved = createdItems.filter((it) => it.itemId < 0);
      await Promise.all(
        unsaved.map((it) => {
          const payload = {
            ...it,
            object: { objectId: it.object.objectId },
            work: { workId: +workId },
            color: it.colorId != null ? { colorId: it.colorId } : null,
            material: it.material ?? ""
            // töröld ki a colorId mezőt, ha szükséges
          };
          return dispatch(createdItemApi.createCreatedItemApi(payload));
        })
      );

      // 2) Frissítjük a Work-öt
      await dispatch(updateWork(localWork));

      // 3) Újra lekérjük a backendről a tényleges createdItems-eket
      const refreshed = await Promise.all(
        objects.map((o) => dispatch(getCreatedItemsByObject(o.objectId)))
      );
      //     setCreatedItems([].concat(...refreshed));

      // 4) Visszalépünk
      window.history.back();
    } catch (err) {
      console.error("Error saving work and items:", err);
    } finally {
      setLoading(false);
    }
  };

  const parseSetting = (str) =>
    (str || "").split(",").reduce((acc, p) => {
      const [k, v] = p.split(":");
      if (k && v) acc[k.trim()] = +v;
      return acc;
    }, {});

  const handleDeleteObject = (id) => {
    if (isOrdered) return;
    setObjectToDelete(id);
    setShowDeleteModal(true);
  };
  const confirmDeleteObject = async () => {
    if (objectToDelete != null) {
      await dispatch(objectApi.deleteObjectApi(objectToDelete));
      const all = await dispatch(getAllObjects());
      setObjects(all.filter((o) => o.work?.workId === +workId));
      setSelectedTab("0");
      setShowDeleteModal(false);
      setObjectToDelete(null);
      setLocalWork((w) => ({
        ...w,
        objects: all.filter((o) => o.work?.workId === w.workId)
      }));
    }
  };
  // 1) Hozzáadjuk a törléskezelőt:
  const handleDeleteItem = (index) => {
    const item = createdItems[index];
    if (item.itemId && item.itemId > 0) {
      // törlés API-n keresztül
      dispatch(createdItemApi.deleteCreatedItemApi(item.itemId))
        .then(() => {
          //  setCreatedItems((prev) => prev.filter((_, i) => i !== index));
        })
        .catch((err) => console.error("Error deleting createdItem:", err));
    } else {
      // csak lokális, még nem mentett tétel
      //   setCreatedItems((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // UI helpers for palette modal
  const openPalette = () => setShowPaletteModal(true);
  const closePalette = () => setShowPaletteModal(false);
  const selectColor = (c) => {
    setPalette((p) =>
      p.length < 5 && !p.some((x) => x.colorId === c.colorId) ? [...p, c] : p
    );
    closePalette();
  };
  const removeColor = (cid) =>
    setPalette((p) => p.filter((x) => x.colorId !== cid));

  // layout panel resizing
  const onMouseDown = (e) => {
    startXRef.current = e.clientX;
    startWidthRef.current = panelWidth;
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };
  const onMouseMove = (e) => {
    const dx = e.clientX - startXRef.current;
    const newW = Math.min(
      40,
      Math.max(15, startWidthRef.current - (dx / window.innerWidth) * 100)
    );
    setPanelWidth(newW);
  };
  const onMouseUp = () => {
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  };

  return (
    <div style={{ position: "relative", height: "94vh" }}>
      {/* Palette Modal */}
      <Modal show={showPaletteModal} onHide={closePalette} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Válassz egy színt</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row xs={2} md={3} lg={4} className="g-3">
            {colors.map((c) => (
              <Col key={c.colorId}>
                <Card
                  onClick={() => selectColor(c)}
                  style={{ cursor: "pointer" }}
                >
                  <RBImage
                    src={`data:image/jpeg;base64,${c.imageDataReduced}`}
                    height={100}
                    style={{ objectFit: "cover" }}
                  />
                  <Card.Body className="p-2 text-center">
                    <div className="color-name-container" data-name={c.name}>
                      <span className="color-name">{c.name}</span>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Modal.Body>
      </Modal>

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Törlés megerősítése</Modal.Title>
        </Modal.Header>
        <Modal.Body>Biztosan törölni szeretnéd?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Mégsem
          </Button>
          <Button variant="danger" onClick={confirmDeleteObject}>
            Törlés
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Navigation Tabs */}
      <Nav
        variant="tabs"
        activeKey={selectedTab}
        onSelect={handleSelectTab}
        className="mb-2"
      >
        {!isOrdered && (
          <Nav.Item>
            <Nav.Link
              eventKey="newObject"
              onClick={() => {
                setShowForm(true);
                setShowModel(false);
              }}
            >
              Új bútor
            </Nav.Link>
          </Nav.Item>
        )}
        <Nav.Item>
          <Nav.Link eventKey="0" onClick={() => setShowForm(false)}>
            Teljes modell
          </Nav.Link>
        </Nav.Item>
        <NavDropdown
          style={{ width: "100px" }}
          title={
            selectedTab === "0"
              ? "Bútorok"
              : objects.find((o) => o.objectId.toString() === selectedTab)
                  ?.name || "Bútor"
          }
          id="objects-dropdown"
        >
          {!isOrdered && (
            <NavDropdown.Item
              eventKey="newObject"
              onClick={() => {
                setShowForm(true);
                setShowModel(false);
              }}
            >
              Új bútor
            </NavDropdown.Item>
          )}
          <NavDropdown.Divider />
          {objects.map((o) => (
            <NavDropdown.Item key={o.objectId} eventKey={o.objectId.toString()}>
              {o.objectId} | {o.name}
              {!isOrdered && (
                <Button
                  variant="light"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteObject(o.objectId);
                  }}
                  style={{ marginLeft: 8, padding: "2px 6px" }}
                >
                  x
                </Button>
              )}
            </NavDropdown.Item>
          ))}
        </NavDropdown>
        <div className="d-flex align-items-center ms-auto">
          {palette.map((c) => (
            <div
              key={c.colorId}
              className="position-relative me-1"
              style={{ width: 40, height: 40 }}
            >
              <RBImage
                src={`data:image/jpeg;base64,${c.imageDataReduced}`}
                thumbnail
                style={{ width: "100%", height: "100%" }}
              />
              <span
                onClick={() => removeColor(c.colorId)}
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  color: "red",
                  cursor: "pointer",
                  background: "white",
                  borderRadius: "50%",
                  width: "1rem",
                  height: "1rem",
                  textAlign: "center",
                  lineHeight: "1rem"
                }}
              >
                –
              </span>
            </div>
          ))}
          {palette.length < 5 && (
            <div
              onClick={openPalette}
              className="border bg-light d-flex align-items-center justify-content-center"
              style={{ width: 40, height: 40, cursor: "pointer" }}
            >
              <IonIcon icon={add} />
            </div>
          )}
        </div>
        <Button onClick={handleSaveWork} className="ms-2">
          Munka mentése
        </Button>
      </Nav>

      {/* Main Content */}

      <div className="d-flex" style={{ height: "85vh", overflow: "hidden" }}>
        {/* Left Panel */}
        <div style={{ flex: 1, overflowY: "hidden" }}>
          {(selectedTab === "0" || selectedTab === "newObject") &&
            showModel && (
              <ModelViewer
                key={selectedTab}
                objects={objects}
                createdItems={createdItems}
                usedColors={palette}
                onItemUpdate={handleModelViewerUpdate} // ha egy box‑ot mozgatsz
                onObjectUpdate={handleObjectUpdate}
                roomSize={parseRoom(localWork?.room || "[2500, 5000, 5000]")}
                onRoomSizeChange={handleRoomChange}
              />
            )}
          {selectedTab === "newObject" && showForm && (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                height: "100%",
                overflow: "hidden"
              }}
            >
              <ScriptCaller
                newObjectKey="new"
                onSave={async (generatedItems) => {
                  // 1) Lezárjuk a formot, vissza a modellre
                  setShowForm(false);
                  setShowModel(true);

                  try {
                    // 2) MENTÉS: egyszerre batch létrehozás
                    /*  await dispatch(
                      createdItemApi.createCreatedItemApi(generatedItems)
                    );*/

                    // 3) Frissítjük az objektum‑lista UI‑t
                    const all = await dispatch(getAllObjects());
                    setObjects(all.filter((o) => o.work?.workId === +workId));

                    // 4) Átváltunk a teljes modell nézetre
                    setSelectedTab("0");
                  } catch (err) {
                    console.error("Hiba a CreatedItems mentésekor:", err);
                    alert("Nem sikerült elmenteni az elemeket.");
                  }
                }}
                palette={palette}
                onColorSelect={selectColor}
                onColorRemove={removeColor}
                showPaletteModal={showPaletteModal}
                openPaletteModal={openPalette}
                closePaletteModal={closePalette}
                style={{ flex: 1 }}
              />
            </div>
          )}
          {selectedTab !== "0" && selectedTab !== "newObject" && (
            <ObjectViewer
              object={objects.find((o) => o.objectId === +selectedTab)}
              createdItems={createdItems.filter(
                (it) => it.object.objectId === +selectedTab
              )}
              usedColors={palette}
              onItemUpdate={handleObjectViewerUpdate}
            />
          )}
        </div>

        {/* Splitter + Right Panel */}
        {!showForm && selectedTab !== "newObject" && (
          <>
            <div
              onMouseDown={onMouseDown}
              style={{
                width: "5px",
                cursor: "col-resize",
                backgroundColor: "#ccc"
              }}
            />
            <div
              style={{
                width: collapsed ? 0 : `${panelWidth}vw`,
                minWidth: collapsed ? 0 : "15vw",
                maxWidth: "40vw",
                overflowY: "hidden",
                padding: collapsed ? 0 : "1rem",
                backgroundColor: "#f9f9f9",
                transition: "width 0.2s ease"
              }}
            >
              {!collapsed && (
                <>
                  {selectedTab !== "0" && (
                    <>
                      <h3>Beállítások</h3>
                      {currentObject.map((o) => (
                        <div key={o.objectId}>
                          <h4
                            onClick={() =>
                              setSettingDetails((sd) =>
                                sd.includes(o.objectId)
                                  ? sd.filter((id) => id !== o.objectId)
                                  : [...sd, o.objectId]
                              )
                            }
                            style={{ cursor: "pointer" }}
                          >
                            {o.name}
                          </h4>
                          {settingDetails.includes(o.objectId) &&
                            Object.entries(parseSetting(o.setting)).map(
                              ([k, v]) => (
                                <p key={k}>
                                  {dispatch(getSettingById(k))?.name}: {v}
                                </p>
                              )
                            )}
                        </div>
                      ))}
                    </>
                  )}
                  <h3 className="mt-4 d-flex align-items-center">
                    Elemek
                    {selectedTab !== "0" &&
                      selectedTab !== "newObject" &&
                      !isOrdered && (
                        <Button
                          size="sm"
                          variant="outline-primary"
                          className="ms-2"
                          onClick={handleAddItem}
                        >
                          Elem hozzáadása
                        </Button>
                      )}
                  </h3>
                  <div style={{ maxHeight: "78vh", overflowY: "auto" }}>
                    <GeneratedItemsList
                      generatedItems={createdItems}
                      palette={palette}
                      collapsedColors={collapsedColors}
                      toggleColor={(cid) =>
                        setCollapsedColors((cc) => ({
                          ...cc,
                          [cid]: !cc[cid]
                        }))
                      }
                      readOnly={isOrdered}
                      handleItemChange={handleCreatedItemChange}
                      handleItemColorChange={(idx, color) =>
                        handleCreatedItemChange(idx, { colorId: color.colorId })
                      }
                      onDragEnd={(result) => {
                        const { destination, draggableId } = result;
                        if (!destination) return;
                        const idx = +draggableId;
                        const newCid =
                          destination.droppableId === "no-color"
                            ? null
                            : +destination.droppableId;
                        handleCreatedItemChange(idx, { colorId: newCid });
                      }}
                      onDelete={handleDeleteItem}
                      objects={objects}
                    />
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default EditWork;
