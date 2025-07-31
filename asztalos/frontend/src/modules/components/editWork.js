// EditWork.js
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import GeneratedItemsList from "../helpers/GeneratedItemsList.js";
import createdItemApi from "../../data/api/createdItemApi";
import {
  Button,
  ButtonGroup,
  Nav,
  NavDropdown,
  Modal,
  Card,
  Row,
  Col,
  Image as RBImage,
  Form
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
  const [toRegenerate, setToRegenerate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("0");
  const [showForm, setShowForm] = useState(false);
  const [showModel, setShowModel] = useState(true);
  const [tablesGenerated, setTablesGenerated] = useState(false);
  const [objects, setObjects] = useState([]);
  const [hiddenItems, setHiddenItems] = useState(new Set());
  const toggleItemVisibility = (itemId) => {
    console.log("hiding item: ", itemId);
    setHiddenItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  };
  const parseJsonArray = (str = "") => {
    if (!str.startsWith("[")) return [];
    try {
      return JSON.parse(str);
    } catch {
      // fallback: "[a,b,c]" → ["a","b","c"] → [Number(a),...]
      return str
        .slice(1, -1)
        .split(",")
        .map((x) => {
          const n = parseFloat(x);
          return isNaN(n) ? x.trim() : n;
        });
    }
  };

  const [swapSourceColor, setSwapSourceColor] = useState(undefined);
  const createdItems = useSelector(
    (state) =>
      state.createdItems.filter((item) => item.work?.workId === Number(workId)),
    shallowEqual
  );

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
  const groups = React.useMemo(
    () => Array.from(new Set(colors.map((c) => c.groupName))),
    [colors]
  );
  const [selectedGroup, setSelectedGroup] = useState(groups[0] || "");
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

  // EditWork.js
  const handleRegenerate = useCallback(
    async (obj) => {
      // obj.setting valójában egy JSON-string
      const fullConfig = JSON.parse(obj.setting);

      // szétdaraboljuk dims-re és a többi settingre
      const { width, height, depth, ...otherConfig } = fullConfig;
      const dims = { width, height, depth };

      // lekérjük a korábbi createdItems-t (override)
      const items = await dispatch(getCreatedItemsByObject(obj.objectId));

      // átadjuk a ScriptCaller-nek
      setToRegenerate({
        originalObject: obj,
        scriptId: obj.usedScript.scriptId,
        config: otherConfig,
        dims,
        items
      });
    },
    [dispatch]
  );

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
      // ha nincs megadva, tartsuk meg mm-ben a defaultot:
      return { h: 2500, w: 5000, d: 5000 };
    }
    const [h, w, d] = roomStr
      .slice(1, -1)
      .split(",")
      .map((n) => parseFloat(n) || 0);
    // megmarad mm-ben:
    return { h, w, d };
  };

  const handleRoomChange = (axis, value) => {
    const num = parseFloat(value) || 0;
    const old = parseRoom(localWork.room);
    const next = { ...old, [axis]: num };
    // összeállítjuk a mm‑es stringet
    const roomStr = `[${next.h},${next.w},${next.d}]`;
    // 1) frissítsd a helyi stétet
    setLocalWork((w) => ({ ...w, room: roomStr }));
    // 2) küldjed el a backendre
    dispatch(updateWork({ ...localWork, room: roomStr }));
  };

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
      } catch (err) {
        console.error("Failed to load createdItems:", err);
      }
    };

    loadItems();
  }, [objects, selectedTab, workId, dispatch]);

  // update palette on createdItems change

  const PFL_COLOR = useSelector((state) =>
    state.colors.find((c) => c.colorId === -1)
  ) || {
    colorId: -1,
    name: "PFL",
    hex: "#FFFFFF",
    imageDataReduced: "",
    imageData: ""
  };

  useEffect(() => {
    const itemColorIds = Array.from(
      new Set(
        createdItems
          .map((it) => it.color?.colorId)
          .filter((cid) => cid != null && cid !== -1)
      )
    );

    // 2) a valódi szín‐objektumokat hozzuk be
    const usedColors = itemColorIds
      .map((id) => colors.find((c) => c.colorId === id))
      .filter(Boolean);

    // 3) előre tesszük a PFL‐t
    const newPalette = [PFL_COLOR, ...usedColors];
    console.log("itemColorIds: ", itemColorIds, ", newPalette: ", newPalette);
    setPalette(newPalette);
  }, [createdItems, colors]);

  const handleCreatedItemChange = (index, fields) => {
    const orig = createdItems[index];
    const payload = {
      // Mindent, amit a DTO elvár:
      itemId: orig.itemId,
      name: orig.name,
      details: orig.details,
      material: orig.material,
      kant: orig.kant,
      qty: orig.qty,
      position: orig.position,
      rotation: orig.rotation,
      size: orig.size,
      tablePosition: orig.tablePosition,
      tableRotation: orig.tableRotation,

      // Kapcsolatok:
      object: { objectId: orig.object.objectId },
      work: { workId: orig.work.workId },

      // A módosítás:
      ...fields
    };

    dispatch(createdItemApi.updateCreatedItemApi(orig.itemId, payload)).catch(
      (err) => console.error("Error updating createdItem:", err)
    );
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
        color: { colorId: null },
        name: "",
        details: "",
        material: "", // anyag
        rotable: true,
        object: { objectId: +selectedTab },
        work: { workId: +workId }, // ← ide kell a munka
        itemId: Date.now() * -1
      };
    }
  };

  const handleModelViewerUpdate = (updatedItem, groupIdx) => {
    const idx = createdItems.findIndex(
      (it) => it.itemId === updatedItem.itemId
    );
    if (idx !== -1) {
      handleCreatedItemChange(idx, {
        color: { colorId: updatedItem?.colorId },
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
        color: { colorId: updatedItem.color?.colorId },
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
            color: it.colorId != null ? { colorId: it.color?.colorId } : null,
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
  const closePalette = () => {
    setShowPaletteModal(false);
    setSwapSourceColor(null);
  };
  const selectColor = (c) => {
    // if swapSourceColor is any value (null or a number), we’re in swap‑mode
    if (swapSourceColor !== undefined) {
      const bulkUpdates = createdItems
        .filter((it) => {
          const cid = it.color?.colorId;
          // if swapSourceColor===null ⇒ swap from no‑color
          return swapSourceColor === null
            ? cid == null // matches both undefined & null
            : cid === swapSourceColor;
        })
        .map((it) => ({
          itemId: it.itemId,
          color: { colorId: c.colorId }
        }));

      dispatch(createdItemApi.updateMultipleCreatedItemsApi(bulkUpdates)).catch(
        (err) => console.error("Bulk swap failed", err)
      );

      // exit swap‑mode
      setSwapSourceColor(undefined);
      closePalette();
      return;
    }

    // normal “add to palette”:
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

  if (toRegenerate) {
    console.log("EditWork → ScriptCaller navigálás:", {
      initialObject: toRegenerate.originalObject,
      initialScriptId: toRegenerate.scriptId,
      initialConfig: toRegenerate.config,
      initialDims: toRegenerate.dims,
      initialGeneratedItems: toRegenerate.items
    });
    return (
      <ScriptCaller
        initialObject={toRegenerate.originalObject}
        initialScriptId={toRegenerate.scriptId}
        initialConfig={toRegenerate.config}
        initialDims={toRegenerate.dims}
        initialGeneratedItems={toRegenerate.items}
        onSave={() => setToRegenerate(null)}
        palette={palette}
        onColorSelect={selectColor}
        onColorRemove={removeColor}
        showPaletteModal={showPaletteModal}
        openPaletteModal={openPalette}
        closePaletteModal={closePalette}
      />
    );
  }

  return (
    <div style={{ position: "relative", height: "94vh" }}>
      {/* Palette Modal */}
      <Modal show={showPaletteModal} onHide={closePalette} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Válassz egy színt</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group as={Row} className="mb-3">
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "0.5rem",
                marginBottom: "1rem"
              }}
            >
              {groups.map((grp) => (
                <div
                  key={grp}
                  onClick={() => setSelectedGroup(grp)}
                  style={{
                    padding: "0.75rem 1.5rem",
                    borderRadius: "1rem",
                    background: selectedGroup === grp ? "#0d6efd" : "#e9ecef",
                    color: selectedGroup === grp ? "#fff" : "#000",
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "background 0.2s, color 0.2s"
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      selectedGroup === grp ? "#0b5ed7" : "#d4d8dc")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background =
                      selectedGroup === grp ? "#0d6efd" : "#e9ecef")
                  }
                >
                  {grp}
                </div>
              ))}
            </div>
          </Form.Group>
          <Row xs={2} md={3} lg={4} className="g-3">
            {colors
              .filter((c) => c.groupName === selectedGroup)
              .map((c) => (
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
              {c.imageDataReduced ? (
                <RBImage
                  src={
                    c.imageDataReduced
                      ? `data:image/jpeg;base64,${c.imageDataReduced}`
                      : undefined
                  }
                  thumbnail
                  style={{ width: "100%", height: "100%" }}
                />
              ) : (
                // ha nincs kép, mutassunk egy színes négyzetet hex alapján
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: c.hex || "#ddd"
                  }}
                />
              )}
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
        <div
          style={{
            flex: "1 1 0", // növekedjék és zsugorodjék is
            minWidth: 0, // engedi, hogy a gyerek elemek befelé zsugorodjanak
            overflowY: "hidden"
          }}
        >
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
                hiddenItems={hiddenItems}
              />
            )}
          {selectedTab === "newObject" && showForm && (
            <div
              style={{
                flex: "1 1 0",
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                height: "85vh",
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
                      onRegenerate={handleRegenerate}
                      generatedItems={createdItems}
                      palette={palette}
                      collapsedColors={collapsedColors}
                      onSwap={(colorId) => {
                        setSwapSourceColor(colorId);
                        setShowPaletteModal(true);
                      }}
                      toggleColor={(cid) =>
                        setCollapsedColors((cc) => ({
                          ...cc,
                          [cid]: !cc[cid]
                        }))
                      }
                      readOnly={isOrdered ? isOrdered : false}
                      handleItemChange={handleCreatedItemChange}
                      handleItemColorChange={(idx, color) =>
                        handleCreatedItemChange(idx, {
                          color: { colorId: color.colorId }
                        })
                      }
                      onDragEnd={(result) => {
                        const { destination, draggableId } = result;
                        if (!destination) return;
                        const idx = +draggableId;
                        const newCid =
                          destination.droppableId === "no-color"
                            ? null
                            : +destination.droppableId;
                        handleCreatedItemChange(idx, {
                          color: { colorId: newCid }
                        });
                      }}
                      onDelete={handleDeleteItem}
                      objects={objects}
                      hiddenItems={hiddenItems}
                      onToggleVisibility={toggleItemVisibility}
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
