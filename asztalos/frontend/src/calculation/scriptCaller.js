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
  initialObject,
  initialScriptId,
  initialConfig,
  initialDims,
  initialGeneratedItems = [],
  onSave,
  palette,
  onColorSelect,
  onColorRemove,
  showPaletteModal,
  openPaletteModal,
  closePaletteModal
}) {
  console.log("ScriptCaller beállítások:", {
    initialScriptId,
    initialConfig,
    initialDims,
    initialGeneratedItems
  });
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
  const settingsMeta = useMemo(() => {
    return allSettings.map((s) => {
      let list = s.valueList;
      if (typeof list === "string") {
        list = list.split(",").map((o) => o.trim());
      }
      return { ...s, valueList: Array.isArray(list) ? list : [] };
    });
  }, [allSettings]);

  function parseArrayField(field) {
    if (Array.isArray(field) && field.every((i) => typeof i === "number")) {
      return field;
    }
    if (typeof field === "string") {
      // próbáljuk JSON.parse-szel
      try {
        return JSON.parse(field);
      } catch {
        // fallback: csak számokat szedünk ki a stringből
        return [...field.matchAll(/-?\d+(\.\d+)?/g)].map((m) =>
          parseFloat(m[0])
        );
      }
    }
    return [];
  }

  // local state
  const [selectedScript, setSelectedScript] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [config, setConfig] = useState({});
  const [generatedItems, setGeneratedItems] = useState([]);
  const [objectToView, setObjectToView] = useState(null);
  const [objectToViewData, setObjectToViewData] = useState(null);
  const [collapsedColors, setCollapsedColors] = useState({});
  const toggleColor = (cid) =>
    setCollapsedColors((prev) => ({ ...prev, [cid]: !prev[cid] }));

  useEffect(() => {
    if (!initialScriptId) return;
    const init = async () => {
      // 1) kiválasztjuk a scriptet
      const script = scripts.find((s) => s.scriptId === initialScriptId);
      if (script) setSelectedScript(script);

      // 2) külső API-ból lekérjük a scriptItem-eket (defs)
      await scriptItemApi.getAllScriptItemsForScriptApi(initialScriptId);
      // 3) store-ba is betesszük őket
      await dispatch(getScriptItemsByScript(initialScriptId));

      // 4) ha van override tételek, azokat használjuk, egyébként sima generálás
      if (initialGeneratedItems.length > 0) {
        setGeneratedItems(initialGeneratedItems);
      } else {
        // itt a selectScript már a DEFINÍCIÓKKAL fog futni
        selectScript(script);
      }
    };
    if (initialConfig) {
      setConfig(initialConfig);
    }
    if (
      initialDims &&
      typeof initialDims.width === "number" &&
      typeof initialDims.height === "number" &&
      typeof initialDims.depth === "number"
    ) {
      setDims(initialDims);
    }
    init();
  }, [initialScriptId, initialGeneratedItems, scripts, dispatch]);

  const handleDimBlur = (dim) => (e) => {
    const v = e.target.value;
    setDims((prev) => ({ ...prev, [dim]: v === "" ? "" : Number(v) }));
  };
  // available rooms (excluding "All")
  const rooms = useMemo(() => {
    return Array.from(
      new Set(scripts.map((s) => s.room).filter((r) => r && r !== "All"))
    );
  }, [scripts]);

  // parse setting string "1:100,2:200" → {1:100,2:200}
  function parseSetting(str = "") {
    const obj = Object.fromEntries(
      str
        .split(",")
        .map((p) => p.split(":").map((x) => x.trim()))
        .filter(([k, v]) => k && v)
        .map(([k, v]) => [k, v])
    );
    // ha van width/height/depth kulcs, konvertáljuk számmá
    ["width", "height", "depth"].forEach((dim) => {
      if (obj[dim] != null) obj[dim] = Number(obj[dim]);
    });
    return obj;
  }

  const dimLabels = {
    width: "Szélesség",
    height: "Magasság",
    depth: "Mélység"
  };

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
    const cfg = parseSetting(script.setting);
    const cfgWithDefaults = allSettings.reduce(
      (acc, s) => {
        if (s.valueList?.length && acc[s.settingId] == null) {
          acc[s.settingId] = s.valueList[0];
        }
        return acc;
      },
      { ...cfg }
    );
    setConfig(cfgWithDefaults);
    setDims({
      width: cfgWithDefaults.width ?? "",
      height: cfgWithDefaults.height ?? "",
      depth: cfgWithDefaults.depth ?? ""
    });
    try {
      await scriptItemApi.getAllScriptItemsForScriptApi(script.scriptId);
      await dispatch(getScriptItemsByScript(script.scriptId));
    } catch (error) {
      console.error("Error fetching script items:", error);
    }

    const initialItems = processScript(
      cfgWithDefaults,
      {
        width: cfgWithDefaults.width,
        height: cfgWithDefaults.height,
        depth: cfgWithDefaults.depth
      },
      script.scriptId
    );
    setGeneratedItems(
      initialItems.map((it) => ({
        ...it,
        colorId: it.material === "PFL" ? -1 : null
      }))
    );
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
    const { width, height, depth } = dims;
    const updatedConfig = { ...config, height, width, depth };
    setConfig(updatedConfig);

    const allItems = processScript(
      updatedConfig,
      { height, width, depth },
      selectedScript.scriptId
    );
    // csak ezt kell beállítani:
    setGeneratedItems(
      allItems.map((it) => ({
        ...it,
        colorId: it.material === "PFL" ? -1 : null
      }))
    );
  }

  async function handleSave() {
    if (!generatedItems.length) return;

    try {
      if (initialObject) {
        await dispatch(
          createdItemApi.deleteCreatedItemsByObjectApi(initialObject.objectId)
        );
      }
      // ha initialObject van, akkor UPDATE hajtódik végre:
      let objectPayload;
      if (initialObject) {
        // frissítsük a létező objectet
        const updated = {
          ...initialObject,
          setting: JSON.stringify(config),
          usedColors: palette.map((c) => c.colorId)
          // ha kell: méret/pozíció is
        };
        objectPayload = await dispatch(
          objectApi.updateObjectApi(initialObject.objectId, updated)
        );
      } else {
        // egyébként CREATE
        objectPayload = await dispatch(
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
      }
      console.log("objectPayload: ", objectPayload);
      // mentjük a createdItems-eket is, ugyanúgy:
      const newObjectId = objectPayload.objectId;
      const itemsToSave = generatedItems.map((item) => ({
        ...item,
        object: { objectId: newObjectId },
        work: { workId: selectedWork },
        ...(item.colorId != null && { color: { colorId: item.colorId } })
      }));
      await dispatch(createdItemApi.createMultipleCreatedItemsApi(itemsToSave));

      // callback
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
    // régi box-ok eltávolítása
    scene.meshes
      .filter((m) => m.name.startsWith("box_"))
      .forEach((m) => m.dispose());

    // újraszámoljuk a skálát a dims alapján
    const wNum = dims.width || 0;
    const hNum = dims.height || 0;
    const dNum = dims.depth || 0;
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
  }, [generatedItems, dims]);

  function Header() {
    return (
      <Container fluid className="py-3 border-bottom">
        <Row className="align-items-center">
          <Col xs="auto">
            <h3>
              {selectedScript ? selectedScript.name : "Terv kiválasztása"}
            </h3>
          </Col>
          {selectedScript && (
            <>
              {/* Dimensions inputs */}
              <Col className="d-flex justify-content-center">
                {["width", "height", "depth"].map((dim) => (
                  <Form.Group key={dim} className="mx-2" style={{ width: 120 }}>
                    <Form.Label className="mb-1 text-capitalize">
                      {dimLabels[dim]}
                    </Form.Label>
                    <Form.Control
                      type="number"
                      size="sm"
                      // uncontrolled input, csak a defaultValue-t adjuk át
                      defaultValue={dims[dim]}
                      // és csak blur-nél szinkronizáljuk a state-t
                      onBlur={handleDimBlur(dim)}
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
                  Vissza
                </Button>
                <Button
                  variant="primary"
                  onClick={handleGenerate}
                  className="me-2"
                >
                  Generálás
                </Button>
                <Button variant="success" onClick={handleSave}>
                  Bútor mentése
                </Button>
              </Col>
            </>
          )}
        </Row>
      </Container>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "85vh",
        width: "100%",
        overflow: "hidden"
      }}
    >
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
          style={{
            flex: "1 1 0",
            marginTop: "1rem",
            width: "100%",
            overflow: "hidden",
            paddingRight: "0"
          }}
        >
          <Row
            style={{
              height: "75vh",
              width: "100%",
              overflowX: "hidden"
            }}
          >
            <Col md={3} className="border-end" style={{ width: "25%" }}>
              <h5>Beállítások</h5>
              <Form>
                <Row className="g-2">
                  {Object.entries(config)
                    .filter(
                      ([key]) => !["height", "width", "depth"].includes(key)
                    )
                    .filter(([key]) => {
                      const allowed = selectedScript.setting
                        .split(",")
                        .map((p) => p.split(":")[0]);
                      return allowed.includes(key);
                    })
                    .map(([key, val]) => {
                      const meta = settingsMeta.find(
                        (s) => String(s.settingId) === key
                      );
                      return (
                        <Col
                          xs={12}
                          className="d-flex align-items-center mb-2"
                          key={key}
                        >
                          <Form.Label
                            className="me-2 mb-0"
                            style={{ width: "100%" }}
                          >
                            {settingNameById[key] || key}
                          </Form.Label>
                          {meta?.valueList?.length ? (
                            <Form.Select
                              size="sm"
                              name={key}
                              value={val}
                              onChange={handleConfigChange}
                              style={{ maxWidth: "6rem" }}
                            >
                              {meta.valueList.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </Form.Select>
                          ) : (
                            <Form.Control
                              type="text"
                              size="sm"
                              name={key}
                              value={val}
                              onChange={handleConfigChange}
                              style={{ maxWidth: "6rem" }}
                            />
                          )}
                        </Col>
                      );
                    })}
                </Row>
              </Form>
            </Col>

            <Col
              md={6}
              className="text-center"
              style={{
                flex: "1 1 0",
                minWidth: 0, // ⚠️ engedjük, hogy a gyerek zsugorodjon
                maxHeight: "75vh",
                position: "relative",
                overflow: "hidden",
                maxWidth: "55%"
              }}
            >
              {generatedItems.length > 0 ? (
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "100%", // örökölje a Col által adott 75vh-t
                    overflowX: "hidden", // csak vízszintes kilógást tiltunk
                    overflowY: "auto"
                  }}
                >
                  <ObjectViewer
                    object={
                      objectToViewData || {
                        objectId: 0,
                        position: "[0,0,0]",
                        rotation: "[0,0,0]"
                      }
                    }
                    createdItems={[...generatedItems, ...dummyScriptItems]}
                    usedColors={palette}
                    onItemUpdate={handleItemUpdate}
                  />
                </div>
              ) : (
                <canvas
                  ref={canvasRef}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    display: "block",
                    margin: "auto"
                  }}
                />
              )}
            </Col>

            <Col
              md={3}
              className="border-start"
              style={{
                width: "30%",
                flex: "0 0 auto",
                minWidth: 0, // ⚠️ szükséges ahhoz, hogy az oszlop ne nyújtsa szét a sort
                maxHeight: "75vh",
                overflowY: "auto" // csak itt görgessen
              }}
            >
              <div style={{ flex: 1, overflowY: "auto" }}>
                <h5 className="d-flex align-items-center justify-content-between">
                  Generált elemek
                  <Button size="sm" variant="secondary" onClick={handleAddNew}>
                    Új méret hozzáadás
                  </Button>
                </h5>
                <div style={{ overflow: "auto", maxHeight: "71vh" }}>
                  <GeneratedItemsList
                    generatedItems={generatedItems}
                    palette={palette}
                    collapsedColors={collapsedColors}
                    toggleColor={toggleColor}
                    handleItemChange={handleItemChange}
                    handleItemColorChange={handleItemColorChange}
                    onDragEnd={onDragEnd}
                    onDelete={(idx) =>
                      setGeneratedItems((old) =>
                        old.filter((_, i) => i !== idx)
                      )
                    }
                  />
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      )}
    </div>
  );
}
