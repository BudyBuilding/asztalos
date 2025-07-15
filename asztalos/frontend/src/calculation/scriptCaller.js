import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Modal,
  Card,
  Image as RBImage
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { IonIcon } from "@ionic/react";
import { chevronDown, chevronForward, add } from "ionicons/icons";
import processScript from "./itemGenerator/processScript";
import Item from "../modules/helpers/item.js";
import objectApi from "../data/api/objectApi";
import createdItemApi from "../data/api/createdItemApi";
import { fetchScriptItemsForScript } from "../data/storeManager";
import ObjectViewer from "../model/ObjectViewer";
import { clearSelectedScriptItems } from "../data/store/actions/scriptStoreFunctions";
import GeneratedItemsList from "../modules/helpers/GeneratedItemsList.js";
import {
  getAllScripts,
  getSelectedClient,
  getSelectedWork,
  getAllScriptItems,
  getAllSettings,
  getAllColors,
  getImageById,
  getColorById,
  getScriptItemsByScript
} from "../data/getters";
import {
  Engine,
  Scene,
  Vector3,
  MeshBuilder,
  ArcRotateCamera,
  HemisphericLight,
  StandardMaterial,
  Color3,
  Color4
} from "@babylonjs/core";
import scriptItemApi from "../data/api/scriptItemApi";
export default function ScriptCaller({
  onSave,
  palette,
  onColorSelect,
  onColorRemove,
  showPaletteModal,
  openPaletteModal,
  closePaletteModal
}) {
  const dispatch = useDispatch();

  // selectors via dispatch(useSelector)
  const scripts = dispatch(useSelector(getAllScripts)) || [];
  const selectedWork = dispatch(useSelector(getSelectedWork));
  const selectedClient = dispatch(useSelector(getSelectedClient));
  const scriptItems = dispatch(useSelector(getAllScriptItems)) || [];
  const allSettings = dispatch(useSelector(getAllSettings)) || [];
  //const allColors = dispatch(useSelector(getAllColors)) || [];
  const [dummyScriptItems, setDummyScriptItems] = useState([]);
  const [dims, setDims] = useState({ width: "", height: "", depth: "" });
  // map settingId → name
  const settingNameById = useMemo(() => {
    const m = {};
    allSettings.forEach((s) => {
      m[s.settingId] = s.name;
    });
    return m;
  }, [allSettings]);
  // local state
  const [selectedScript, setSelectedScript] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [config, setConfig] = useState({});
  const [generatedItems, setGeneratedItems] = useState([]);
  const [objectToView, setObjectToView] = useState(null);
  const [objectToViewData, setObjectToViewData] = useState(null);
  let lastGenerated = Date.now();
  const [collapsedColors, setCollapsedColors] = useState({});
  const toggleColor = (cid) =>
    setCollapsedColors((prev) => ({ ...prev, [cid]: !prev[cid] }));

  // refs for width/height/depth inputs
  const heightRef = useRef(null);
  const widthRef = useRef(null);
  const depthRef = useRef(null);

  // available rooms (excluding "All")
  const rooms = useMemo(() => {
    return Array.from(
      new Set(scripts.map((s) => s.room).filter((r) => r && r !== "All"))
    );
  }, [scripts]);

  // parse setting string "1:100,2:200" → {1:100,2:200}
  function parseSetting(str = "") {
    return Object.fromEntries(
      str
        .split(",")
        .map((p) => p.split(":").map((x) => x.trim()))
        .filter(([k, v]) => k && v)
        .map(([k, v]) => [k, v])
    );
  }

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;

    const idx = parseInt(draggableId, 10);
    const newColorId =
      destination.droppableId === "no-color"
        ? null
        : Number(destination.droppableId);

    setGeneratedItems((old) => {
      const copy = [...old];
      copy[idx] = { ...copy[idx], colorId: newColorId };
      return copy;
    });
  };

  // most két paramétert várunk: az updated item-et és annak indexét
  const handleItemUpdate = (updated, idx) => {
    setGeneratedItems((old) => {
      const copy = [...old];
      copy[idx] = updated;
      return copy;
    });
  };
  // add new default item
  const handleAddNew = () => {
    const defaultItem = {
      size: "[1,1,18]",
      sizeArr: [1, 1, 1],
      qty: 1,
      kant: "[-,0,0]",
      colorId: null,
      rotable: true,
      details: "",
      position: [0, 0, 0],
      rotation: [0, 0, 0]
    };
    setGeneratedItems((old) => [...old, defaultItem]);
  };

  // when a script is chosen
  async function selectScript(script) {
    setSelectedScript(script);
    setConfig(parseSetting(script.setting));
    try {
      await scriptItemApi.getAllScriptItemsForScriptApi(script.scriptId);
      await dispatch(getScriptItemsByScript(script.scriptId));
    } catch (error) {
      console.error("Error fetching script items:", error);
    }
  }

  // handle config field changes
  function handleConfigChange(e) {
    const { name, value } = e.target;
    setConfig((prev) => ({ ...prev, [name]: value }));
  }

  // go back to script selection
  function handleBack() {
    setSelectedScript(null);
    setConfig({});
    dispatch(clearSelectedScriptItems());
    setGeneratedItems([]);
  }

  function handleGenerate() {
    if (!selectedScript) return;
    const height = Number(heightRef.current.value);
    const width = Number(widthRef.current.value);
    const depth = Number(depthRef.current.value);
    const updatedConfig = { ...config, height, width, depth };
    setConfig(updatedConfig);

    // feldolgozzuk a scriptet
    const items = processScript(
      updatedConfig,
      { height, width, depth },
      selectedScript.scriptId
    );
    // defaultként add hozzá a palette[0]‑t minden újnak
    const itemsWithColor = items.map((it) => ({
      ...it,
      colorId: it.material === "PFL" ? -1 : null
    }));
    setGeneratedItems(itemsWithColor);
    widthRef.current.value = width;
    heightRef.current.value = height;
    depthRef.current.value = depth;
    // dummy tételek készítése refScriptId alapján
    const realItems = items.filter((i) => !i.refScriptId);
    const refItems = items.filter((i) => !!i.refScriptId);

    setDummyScriptItems([]); // töröljük az előzőeket
    refItems.forEach((ref) => {
      dispatch(fetchScriptItemsForScript(ref.refScriptId))
        .then(() => {
          const nested = processScript(
            updatedConfig,
            { height, width, depth },
            ref.refScriptId
          );
          // dummy attribútumok beállítása:
          const dummies = nested.map((it) => ({
            ...it,
            isDummy: true,
            qty: 1,
            rotable: false,
            kant: "[-,0,0]",
            parentRef: ref.scriptItemId
          }));
          setDummyScriptItems((prev) => [...prev, ...dummies]);
        })
        .catch((err) =>
          console.error("Error fetching nested script items:", err)
        );
    });
  }

  // save object  created items
  async function handleSave() {
    if (!generatedItems.length) return;

    try {
      // 1) Objektum létrehozása és a válasz adatainak kicsomagolása
      const objectPayload = await dispatch(
        objectApi.createObjectApi({
          name: selectedScript.name,
          usedScript: { scriptId: selectedScript.scriptId },
          work: { workId: selectedWork },
          client: { clientId: selectedClient },
          usedColors: palette.map((c) => c.colorId),
          setting: JSON.stringify(config),
          size: "[0,0,0]",
          position: "[0,0,0]",
          rotation: "[0,0,0]"
        })
      );

      const newObjectId = objectPayload.objectId;
      setObjectToView(newObjectId);
      setObjectToViewData(objectPayload);

      // 2) CreatedItems payload összeállítása
      const itemsToSave = generatedItems.map((item) => ({
        size: item.size,
        qty: item.qty,
        name: item.name || "name",
        material: item.material,
        kant: item.kant,
        position: item.position,
        rotation: item.rotation,
        details: item.details || "",
        rotable: item.rotable,
        scriptItem: { scriptItemId: item.scriptItemId || null },
        ...(item.colorId != null && { color: { colorId: item.colorId } }),
        object: {
          objectId: newObjectId // ✅ csak az ID
        },
        work: { workId: selectedWork } // ✅ csak az ID
      }));

      // 3) CreatedItems mentése
      const createdItemsResponse = await dispatch(
        createdItemApi.createMultipleCreatedItemsApi(itemsToSave)
      );

      // 4) Visszahívjuk a onSave callback-et
      onSave();
    } catch (err) {
      console.error("Hiba mentéskor:", err);
    }
  }

  // assign a color to a generated item
  const handleItemColorChange = (index, color) => {
    setGeneratedItems((prev) => {
      const arr = [...prev];
      // ← store on the exact same key your viewer expects:
      arr[index] = { ...arr[index], colorId: color.colorId };
      return arr;
    });
  };

  // általános item változtatás pl. mennyiség vagy size
  const handleItemChange = (index, updatedFields) => {
    const updated = { ...generatedItems[index], ...updatedFields };
    setGeneratedItems((prev) => {
      const arr = [...prev];
      arr[index] = updated;
      return arr;
    });
  };

  const itemsByColor = useMemo(() => {
    return generatedItems.reduce((acc, item, idx) => {
      const cid = item.colorId ?? "no-color";
      if (!acc[cid]) acc[cid] = [];
      acc[cid].push({ ...item, __idx: idx });
      return acc;
    }, {});
  }, [generatedItems]);

  // Babylon.js setup for 3D preview
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);

  useEffect(() => {
    // ha már az ObjectViewer-t nézzük, ne inicializáljuk újra a canvas-t
    if (objectToView) return;

    if (!canvasRef.current) return;
    const engine = new Engine(canvasRef.current, true);
    const scene = new Scene(engine);
    scene.clearColor = new Color4(1, 1, 1, 1);
    sceneRef.current = scene;

    const camera = new ArcRotateCamera(
      "camera",
      Math.PI / 2,
      Math.PI / 4,
      10,
      Vector3.Zero(),
      scene
    );
    camera.attachControl(canvasRef.current, true);
    camera.wheelPrecision = 50;
    new HemisphericLight("light", new Vector3(0, 1, 0), scene);

    engine.runRenderLoop(() => scene.render());
    return () => engine.dispose();
  }, [objectToView]);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    scene.meshes
      .filter((m) => m.name.startsWith("box_"))
      .forEach((m) => m.dispose());

    const wNum = Number(widthRef.current?.value || 0);
    const hNum = Number(heightRef.current?.value || 0);
    const dNum = Number(depthRef.current?.value || 0);
    const maxDim = Math.max(wNum, hNum, dNum) || 1;
    const globalScale = 1 / maxDim;

    generatedItems.forEach((itm, idx) => {
      const [w, h, d] = itm.size;
      const [px, py, pz] = itm.position;
      const [rx, ry, rz] = itm.rotation;

      const sw = w * globalScale,
        sh = h * globalScale,
        sd = d * globalScale;
      const x = px * globalScale,
        y = py * globalScale,
        z = pz * globalScale;

      const box = MeshBuilder.CreateBox(
        `box_${idx}`,
        { width: sw, height: sh, depth: sd },
        scene
      );
      box.position = new Vector3(x + sw / 2, y + sh / 2, z + sd / 2);
      box.rotation = new Vector3(
        (rx * Math.PI) / 2,
        (ry * Math.PI) / 2,
        (rz * Math.PI) / 2
      );
      const mat = new StandardMaterial(`mat_${idx}`, scene);
      mat.diffuseColor = new Color3(0.3, 0.3, 0.3);
      box.material = mat;
    });
  }, [generatedItems]);

  function Header() {
    return (
      <Container fluid className="py-3 border-bottom">
        <Modal show={showPaletteModal} onHide={closePaletteModal} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Válassz egy színt</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row xs={2} md={3} lg={4} className="g-3">
              {palette.map((color) => {
                const imageUrl = color.imageData;
                return (
                  <Col key={color.colorId}>
                    <Card
                      onClick={() => onColorSelect(color)}
                      style={{ cursor: "pointer" }}
                    >
                      <RBImage
                        src={imageUrl && `data:image/jpeg;base64,${imageUrl}`}
                        style={{ height: 100, objectFit: "cover" }}
                      />
                      <Card.Body className="p-2 text-center">
                        <Card.Text className="mb-0">{color.name}</Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </Modal.Body>
        </Modal>
        <Row className="align-items-center">
          <Col xs="auto">
            <h3>{selectedScript ? selectedScript.name : "Script Selector"}</h3>
          </Col>
          {selectedScript && (
            <>
              {/* Dimensions inputs */}
              <Col className="d-flex justify-content-center">
                {["width", "height", "depth"].map((dim) => (
                  <Form.Group key={dim} className="mx-2" style={{ width: 120 }}>
                    <Form.Label className="mb-1 text-capitalize">
                      {dim}
                    </Form.Label>
                    <Form.Control
                      type="number"
                      size="sm"
                      ref={
                        dim === "width"
                          ? widthRef
                          : dim === "height"
                          ? heightRef
                          : depthRef
                      }
                    />
                  </Form.Group>
                ))}
              </Col>

              {/* Action buttons */}
              <Col xs="auto">
                <Button
                  variant="outline-secondary"
                  onClick={handleBack}
                  className="me-2"
                >
                  Back
                </Button>
                <Button
                  variant="primary"
                  onClick={handleGenerate}
                  className="me-2"
                >
                  Generate
                </Button>
                <Button variant="success" onClick={handleSave}>
                  Save
                </Button>
              </Col>
            </>
          )}
        </Row>
      </Container>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Header />
      {!selectedScript ? (
        <Container
          className="mt-4"
          fluid
          style={{ flex: 1, overflowY: "auto" }}
        >
          <Form.Group className="mb-3" style={{ maxWidth: "25vw" }}>
            <Form.Label>Válassz szobát</Form.Label>
            <Form.Select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
            >
              <option value="">-- Válassz egy szobát --</option>
              {rooms.map((room) => (
                <option key={room} value={room}>
                  {room}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          {selectedRoom && (
            <div className="d-flex overflow-auto">
              {scripts
                .filter((s) => s.room === selectedRoom || s.room === "All")
                .map((s) => (
                  <div
                    key={s.scriptId}
                    className="me-3 p-2 border"
                    style={{
                      cursor: "pointer",
                      width: 150, // fix szélesség
                      height: 150, // opcionálisan fix magasság is
                      display: "flex",
                      flexDirection: "column",
                      overflow: "hidden" // kilógó levágása
                    }}
                    onClick={() => selectScript(s)}
                  >
                    {s.imageData && (
                      <img
                        src={`data:image/jpeg;base64,${s.imageData}`}
                        alt={s.name}
                        style={{
                          width: "100%",
                          height: "100px",
                          objectFit: "cover",
                          marginBottom: "0.5rem"
                        }}
                      />
                    )}
                    <p
                      className="mb-0"
                      style={{
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis"
                      }}
                    >
                      {s.name}
                    </p>
                  </div>
                ))}
            </div>
          )}
        </Container>
      ) : (
        <Container
          fluid
          style={{ flex: 1, overflowY: "auto", marginTop: "1rem" }}
        >
          <Row style={{ height: "100%" }}>
            <Col md={3} className="border-end">
              <h5>Settings</h5>
              <Form>
                <Row className="g-2">
                  {Object.entries(config)
                    .filter(
                      ([key]) => !["height", "width", "depth"].includes(key)
                    )
                    .map(([key, val]) => (
                      <Col
                        xs={12}
                        className="d-flex align-items-center mb-2"
                        key={key}
                      >
                        <Form.Label
                          className="me-2 mb-0 text-capitalize"
                          style={{ width: "100%" }}
                        >
                          {settingNameById[key] || key}
                        </Form.Label>
                        <Form.Control
                          type="text"
                          size="sm"
                          name={key}
                          value={val}
                          onChange={handleConfigChange}
                          style={{ maxWidth: "6rem" }}
                        />
                      </Col>
                    ))}
                </Row>
              </Form>
            </Col>

            <Col md={6} className="text-center">
              {generatedItems.length > 0 ? (
                <ObjectViewer
                  object={
                    objectToViewData || {
                      objectId: 0,
                      position: "[0,0,0]",
                      rotation: "[0,0,0]"
                    }
                  }
                  //createdItems={generatedItems}
                  createdItems={[...generatedItems, ...dummyScriptItems]}
                  usedColors={palette}
                  onItemUpdate={handleItemUpdate}
                />
              ) : (
                <canvas ref={canvasRef} style={{ width: "100%" }} />
              )}
            </Col>

            <Col md={3} className="border-start">
              <h5>Selected Colors</h5>
              <div className="d-flex mb-3">
                {palette.map((color) => {
                  const imageUrl = color.imageDataReduced;
                  return (
                    <div
                      key={color.colorId}
                      className="position-relative me-1"
                      style={{ width: 40, height: 40 }}
                    >
                      <RBImage
                        src={`data:image/jpeg;base64,${imageUrl}`}
                        thumbnail
                        style={{ width: "100%", height: "100%" }}
                      />
                      <span
                        onClick={() => onColorRemove(color.colorId)}
                        style={{
                          position: "absolute",
                          top: 0,
                          right: 0,
                          color: "red",
                          background: "white",
                          borderRadius: "50%",
                          cursor: "pointer",
                          width: "1rem",
                          height: "1rem",
                          textAlign: "center",
                          lineHeight: "1rem"
                        }}
                      >
                        –
                      </span>
                    </div>
                  );
                })}
                {palette.length < 5 && (
                  <div
                    className="border bg-light d-flex align-items-center justify-content-center"
                    style={{ width: 40, height: 40, cursor: "pointer" }}
                    onClick={openPaletteModal}
                  >
                    <IonIcon icon={add} />
                  </div>
                )}
              </div>

              <div style={{ flex: 1, overflowY: "auto" }}>
                <h5 className="d-flex align-items-center justify-content-between">
                  Generated Items
                  <Button size="sm" variant="secondary" onClick={handleAddNew}>
                    New Item
                  </Button>
                </h5>
                <GeneratedItemsList
                  generatedItems={generatedItems}
                  palette={palette}
                  collapsedColors={collapsedColors}
                  toggleColor={toggleColor}
                  handleItemChange={handleItemChange}
                  handleItemColorChange={handleItemColorChange}
                  onDragEnd={onDragEnd}
                  onDelete={(idx) =>
                    setGeneratedItems((old) => old.filter((_, i) => i !== idx))
                  }
                />
              </div>
            </Col>
          </Row>
        </Container>
      )}
    </div>
  );
}
