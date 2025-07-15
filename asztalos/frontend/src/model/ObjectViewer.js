import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import {
  Engine,
  Scene,
  Vector3,
  MeshBuilder,
  StandardMaterial,
  Color3,
  Color4,
  ArcRotateCamera,
  HemisphericLight,
  PointLight,
  Texture,
  ActionManager,
  ExecuteCodeAction,
  TransformNode,
  BoundingInfo
} from "@babylonjs/core";
import { IonIcon } from "@ionic/react";
import { documentOutline, documentsOutline } from "ionicons/icons";
import { Modal, Button } from "react-bootstrap";
import {
  getAllCreatedItems,
  getAllObjects,
  getImageById,
  getColorById
} from "../data/getters";

export default function ObjectViewer({
  object: objectProp,
  createdItems: itemsProp,
  usedColors,
  onItemUpdate
}) {
  const dispatch = useDispatch();
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const groupNodesRef = useRef({});

  const [objectData, setObjectData] = useState(null);
  const [createdItems, setCreatedItems] = useState([]);
  const colors = usedColors ?? [];

  // Group move state
  const [isGroupMode, setIsGroupMode] = useState(false);
  const [selectedGroupScriptId, setSelectedGroupScriptId] = useState(null);
  const [groupDelta, setGroupDelta] = useState({ x: 0, y: 0, z: 0 });
  const [groupRotation, setGroupRotation] = useState({ x: 0, y: 0, z: 0 });

  const [itemPosition, setItemPosition] = useState({ x: 0, y: 0, z: 0 });
  const [itemRotation, setItemRotation] = useState({ x: 0, y: 0, z: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGroupIdx, setSelectedGroupIdx] = useState(null);
  const [selectedInstIdx, setSelectedInstIdx] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [picked, setPicked] = useState({
    groupMode: false, // vagy true
    groupId: null,
    groupIdx: null,
    instIdx: null
  });
  // Fetch data
  useEffect(() => {
    if (objectProp && itemsProp) {
      setObjectData(objectProp);
      setCreatedItems(itemsProp);
      return;
    }
    (async () => {
      const all = await dispatch(getAllObjects());
      const id = objectProp?.objectId;
      setObjectData(all.find((o) => o.objectId === id));
      const items = await dispatch(getAllCreatedItems());
      setCreatedItems(items.filter((it) => it.object.objectId === id));
    })();
  }, [dispatch, objectProp, itemsProp]);
  const savedCamRef = useRef(null);
  const engineRef = useRef(null);
  // Modal drag
  const [modalPos, setModalPos] = useState({
    x: window.innerWidth / 2 - 200,
    y: window.innerHeight / 2 - 150
  });
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, origX: 0, origY: 0 });
  const onHeaderMouseDown = (e) => {
    e.preventDefault();
    setDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: modalPos.x,
      origY: modalPos.y
    };
  };
  useEffect(() => {
    const onMouseMove = (e) => {
      if (!dragging) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      setModalPos({
        x: dragRef.current.origX + dx,
        y: dragRef.current.origY + dy
      });
    };
    const onMouseUp = () => setDragging(false);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [dragging]);

  // Babylon init
  useEffect(() => {
    if (!canvasRef.current) return;
    // const engine = new Engine(canvasRef.current, true);
    const engine = new Engine(canvasRef.current, true, {
      adaptToDeviceRatio: true,
      // preserveDrawingBuffer: true,
      stencil: true
    });
    engineRef.current = engine; // ← MENTS EL
    const scene = new Scene(engine);
    scene.autoClear = false;
    scene.clearColor = new Color4(0.9, 0.9, 0.9, 1);
    sceneRef.current = scene;
    scene.onPointerDown = (evt, pickInfo) => {
      if (!pickInfo.hit) {
        // nincs találat ⇒ reset minden highlight
        Object.values(groupNodesRef.current).forEach((node) =>
          node
            .getChildMeshes()
            .forEach(
              (mesh) =>
                mesh.material &&
                (mesh.material.diffuseColor = new Color3(0.7, 0.7, 0.7))
            )
        );

        scene.meshes
          .filter((m) => m.name.startsWith("box_"))
          .forEach(
            (mesh) =>
              mesh.material &&
              (mesh.material.diffuseColor = new Color3(0.7, 0.7, 0.7))
          );
      }
    };

    const camera = new ArcRotateCamera(
      "cam",
      Math.PI / 2,
      Math.PI / 4,
      5000,
      Vector3.Zero(),
      scene
    );
    camera.attachControl(canvasRef.current, true);
    camera.minZ = 0.01;
    cameraRef.current = camera;
    camera.wheelDeltaPercentage = 0.005;
    const hemi = new HemisphericLight("hemi", new Vector3(0, 1, 0), scene);
    hemi.intensity = 1.0; // alap fény erősítése
    hemi.diffuse = new Color3(1, 1, 1); // közvetlen fény fehér
    hemi.groundColor = new Color3(0.8, 0.8, 0.8); // visszavert fény világosabb

    // általános ambient fény:
    scene.ambientColor = new Color3(1, 1, 1);

    /* new HemisphericLight("sky", new Vector3(0, 1, 0), scene);
    new PointLight("fill", new Vector3(0, -10, 0), scene).intensity = 0.2;
    new HemisphericLight(
      "ground",
      new Vector3(0, -1, 0),
      scene
    ).intensity = 0.2;*/
    engine.runRenderLoop(() => {
      engine.clear(scene.clearColor, true, true, true); // <-- mi törlünk
      scene.render();
    });
    window.addEventListener("resize", () => engine.resize());
    camera.onViewMatrixChangedObservable.add(() => {
      savedCamRef.current = {
        target: camera.target.clone(),
        alpha: camera.alpha,
        beta: camera.beta,
        radius: camera.radius
      };
    });
    return () => engine.dispose();
  }, []);

  const fitCamera = (scene, camera) => {
    const meshes = scene.meshes.filter((m) => m.name.startsWith("box_"));
    if (meshes.length === 0) return;

    // 1. Első mesh alapján indítjuk
    let min = meshes[0].getBoundingInfo().boundingBox.minimumWorld.clone();
    let max = meshes[0].getBoundingInfo().boundingBox.maximumWorld.clone();

    // 2. Bejárjuk a többieket, és egyesítjük a bounding box-okat
    for (let i = 1; i < meshes.length; i++) {
      const info = meshes[i].getBoundingInfo().boundingBox;
      min = Vector3.Minimize(min, info.minimumWorld);
      max = Vector3.Maximize(max, info.maximumWorld);
    }

    // 3. Meghatározzuk a center-t és sugarat
    const center = min.add(max).scale(0.5);
    const extent = max.subtract(min).scale(0.5); // félméret minden irányban
    const radius = extent.length(); // ~ boundingSphere sugara

    // 4. Kamera pozíció hozzáigazítása
    const fov = camera.fov;
    const distance = radius / Math.sin(fov / 2);

    camera.setTarget(center);
    camera.radius = distance * 1.1;
    camera.lowerRadiusLimit = distance * 0.8;
    camera.upperRadiusLimit = distance * 10;
  };

  const didInitialFit = useRef(false);
  // Build meshes
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || !objectData || createdItems.length === 0) return;

    // Remove old boxes and group nodes
    scene.meshes
      .filter((m) => m.name.startsWith("box_") || m.name.startsWith("grp_"))
      .forEach((m) => m.dispose());
    // Dispose any existing TransformNode groups
    Object.values(groupNodesRef.current).forEach((node) => node.dispose());
    groupNodesRef.current = {};

    // Compute global scale based on largest dimension
    const maxDim = Math.max(
      ...createdItems.map((it) => parseSizeString(it.size)).flat(),
      1
    );
    const globalScale = 1 / maxDim;

    createdItems.forEach((item, groupIdx) => {
      //  const refId = item.refScriptId;
      const groupId = item.groupId;
      let parentNode = null;

      // For child items, create or get a TransformNode
      if (groupId !== "0") {
        if (!groupNodesRef.current[groupId]) {
          const node = new TransformNode(`grp_${groupId}`, scene);
          groupNodesRef.current[groupId] = node;
        }
        parentNode = groupNodesRef.current[groupId];
      }

      const rawPosList = parseBracketList(item.position, item.qty);
      const rawRotList = parseBracketList(item.rotation, item.qty);
      const [rw, rh, rd] = parseSizeString(item.size);
      const w = rw * globalScale,
        h = rh * globalScale,
        d = rd * globalScale;

      rawPosList.forEach(([x0, y0, z0], instIdx) => {
        const mesh = MeshBuilder.CreateBox(
          `box_${groupIdx}_${instIdx}`,
          { width: w, height: h, depth: d },
          scene
        );

        // ▸ Edge (outline) bekapcsolása
        mesh.enableEdgesRendering();
        mesh.edgesWidth = 0.6; // próbálj ki 1-4-et, ízlés szerint
        mesh.edgesColor = new Color4(0, 0, 0, 1); // fekete körvonal

        // Only set parent if it's a group node
        if (parentNode) {
          mesh.parent = parentNode;
        }
        mesh.setPivotPoint(new Vector3(-w / 2, -h / 2, -d / 2));
        mesh.position = new Vector3(
          x0 * globalScale + w / 2,
          y0 * globalScale + h / 2,
          z0 * globalScale + d / 2
        );

        const [rx, ry, rz] = rawRotList[instIdx] || [0, 0, 0];
        mesh.rotation = new Vector3(
          (rx * Math.PI) / 2,
          (ry * Math.PI) / 2,
          (rz * Math.PI) / 2
        );

        const mat = new StandardMaterial(`mat_${groupIdx}_${instIdx}`, scene);
        if (item.colorId != null) {
          const col = colors.find((c) => c.colorId === item.colorId);
          if (col) {
            const img = col.imageData;
            // self‑lit textúra, nem árnyékolódik:
            mat.emissiveTexture = new Texture(
              `data:image/jpeg;base64,${img}`,
              scene
            );
            mat.emissiveColor = new Color3(0, 0, 0);
            mat.disableLighting = true;
          } else {
            mat.diffuseColor = new Color3(0.7, 0.7, 0.7);
          }
        } else {
          mat.diffuseColor = new Color3(0.7, 0.7, 0.7);
        }

        mesh.material = mat;

        mesh.metadata = { groupIdx, instIdx, groupId };

        mesh.actionManager = new ActionManager(scene);
        mesh.actionManager.registerAction(
          new ExecuteCodeAction(ActionManager.OnLeftPickTrigger, () => {
            // Reset highlights
            Object.values(groupNodesRef.current).forEach((node) =>
              node
                .getChildMeshes()
                .forEach(
                  (m2) => (m2.material.diffuseColor = new Color3(0.7, 0.7, 0.7))
                )
            );

            const { groupIdx: gIdx, instIdx: iIdx, groupId } = mesh.metadata;
            if (groupId !== "0") {
              setIsGroupMode(true);
              setGroupDelta({ x: 0, y: 0, z: 0 });
              setGroupRotation({ x: 0, y: 0, z: 0 });
              setSelectedGroupIdx(groupIdx); // <<< EZ HIÁNYZOTT
              setSelectedInstIdx(instIdx);
              //              setPicked(p => ({ ...p, groupMode: true, groupId, groupIdx: null, instIdx: null }));
              setPicked((p) => ({ ...p, groupMode: true, groupId }));
              setSelectedGroupId(groupId);

              // Highlight group
              const node = groupNodesRef.current[groupId];
              node
                .getChildMeshes()
                .forEach(
                  (m2) => (m2.material.diffuseColor = new Color3(1, 0, 0))
                );
              setIsModalOpen(true);
              return;
            } else {
              setSelectedGroupId(null);
            }

            // Single item mode
            setIsGroupMode(false);
            setPicked((p) => ({
              ...p,
              groupMode: false,
              groupId: null,
              groupIdx: gIdx,
              instIdx: iIdx
            }));
            setSelectedGroupIdx(gIdx);
            setSelectedInstIdx(iIdx);
            setItemPosition({ x: x0, y: y0, z: z0 });
            setItemRotation({ x: rx, y: ry, z: rz });
            mesh.material.diffuseColor = new Color3(1, 0, 0);
            setIsModalOpen(true);
          })
        );
      });
    });

    // Recenter camera
    const cam = cameraRef.current;
    //    fitCamera(scene, cam);
    if (!didInitialFit.current) {
      fitCameraToMeshes(scene, cam);
      didInitialFit.current = true;
    }
  }, [objectData, createdItems, colors, dispatch]);
  const lastResize = useRef(0);

  const fitCameraToMeshes = (scene, camera) => {
    // csak azok a mesh-ek, amik a dobozaid:
    const boxes = scene.meshes.filter((m) => m.name.startsWith("box_"));
    if (!boxes.length) return;

    // egyesítsd mindnek a bounding box-át
    let min = boxes[0].getBoundingInfo().boundingBox.minimumWorld.clone();
    let max = boxes[0].getBoundingInfo().boundingBox.maximumWorld.clone();
    for (let i = 1; i < boxes.length; i++) {
      const bi = boxes[i].getBoundingInfo().boundingBox;
      min = Vector3.Minimize(min, bi.minimumWorld);
      max = Vector3.Maximize(max, bi.maximumWorld);
    }

    // középpont és sugar
    const center = min.add(max).scale(150);
    const radius = max.subtract(min).length();

    // beállítod a kamerát
    camera.setTarget(center);
    // fov figyelembevételével kiszámolod, hogy mekkora távolság kell:
    const distance = radius / Math.sin(camera.fov / 2);
    camera.radius = distance * 1.1; // kis ráhagyás
    camera.lowerRadiusLimit = distance * 0.8;
    camera.upperRadiusLimit = distance * 10;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    //  const engine = sceneRef.current.getEngine();

    const engine = sceneRef.current.getEngine();
    const scheduled = { current: false };

    const ro = new ResizeObserver(() => {
      if (scheduled.current) return;
      scheduled.current = true;

      requestAnimationFrame(() => {
        scheduled.current = false;
        engine.resize(); // nem lőjjük el a loop-ot
      });
    });

    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  // live move
  useEffect(() => {
    if (!isGroupMode || selectedGroupId === "0") return;
    const node = groupNodesRef.current[selectedGroupId];
    const globalScale =
      1 /
      Math.max(...createdItems.map((it) => parseSizeString(it.size)).flat(), 1);
    node.position = new Vector3(
      groupDelta.x * globalScale,
      groupDelta.y * globalScale,
      groupDelta.z * globalScale
    );
    node.rotation = new Vector3(
      (groupRotation.x * Math.PI) / 2,
      (groupRotation.y * Math.PI) / 2,
      (groupRotation.z * Math.PI) / 2
    );
  }, [groupDelta, isGroupMode, selectedGroupId, createdItems, groupRotation]);

  useEffect(() => {
    if (isGroupMode) return;
    if (selectedGroupIdx == null || selectedInstIdx == null) return;

    const mesh = sceneRef.current.getMeshByName(
      `box_${selectedGroupIdx}_${selectedInstIdx}`
    );
    if (!mesh) return;

    const scale =
      1 /
      Math.max(...createdItems.map((it) => parseSizeString(it.size)).flat(), 1);
    const [rw, rh, rd] = parseSizeString(createdItems[selectedGroupIdx].size);

    mesh.position = new Vector3(
      itemPosition.x * scale + (rw * scale) / 2,
      itemPosition.y * scale + (rh * scale) / 2,
      itemPosition.z * scale + (rd * scale) / 2
    );

    mesh.rotation = new Vector3(
      (itemRotation.x * Math.PI) / 2,
      (itemRotation.y * Math.PI) / 2,
      (itemRotation.z * Math.PI) / 2
    );
  }, [
    itemPosition,
    itemRotation,
    isGroupMode,
    selectedGroupIdx,
    selectedInstIdx,
    createdItems
  ]);

  // save
  const handleSave = () => {
    if (isGroupMode && selectedGroupId !== "0") {
      createdItems.forEach((orig, idx) => {
        if (orig.groupId === selectedGroupId) {
          const posList = parseBracketList(orig.position, orig.qty);
          const rotList = parseBracketList(orig.rotation, orig.qty);

          const newPosList = posList.map(([x, y, z]) => [
            x + groupDelta.x,
            y + groupDelta.y,
            z + groupDelta.z
          ]);
          const newRotList = rotList.map(([rx, ry, rz]) => [
            rx + groupRotation.x,
            ry + groupRotation.y,
            rz + groupRotation.z
          ]);

          const newPos = newPosList.map((a) => `[${a.join(",")}]`).join(",");
          const newRot = newRotList.map((a) => `[${a.join(",")}]`).join(",");

          onItemUpdate({ ...orig, position: newPos, rotation: newRot }, idx);
        }
      });
      setIsModalOpen(false);
      return;
    }
    if (selectedGroupIdx == null || selectedInstIdx == null) return;
    const orig = createdItems[selectedGroupIdx];
    const rPos = parseBracketList(orig.position, orig.qty);
    const rRot = parseBracketList(orig.rotation, orig.qty);
    rPos[selectedInstIdx] = [itemPosition.x, itemPosition.y, itemPosition.z];
    rRot[selectedInstIdx] = [itemRotation.x, itemRotation.y, itemRotation.z];
    const newPos = rPos.map((a) => `[${a.join(",")}]`).join(",");
    const newRot = rRot.map((a) => `[${a.join(",")}]`).join(",");
    onItemUpdate(
      { ...orig, position: newPos, rotation: newRot },
      selectedGroupIdx
    );
    setIsModalOpen(false);
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          backgroundColor: "#FFFFFF" // itt is megadhatod
        }}
      />
      <Modal
        show={isModalOpen}
        onHide={() => setIsModalOpen(false)}
        backdropClassName="no-blur-backdrop"
        centered={false}
        dialogAs={({ className, style, children, ...props }) => (
          <div
            {...props}
            className={className}
            style={{
              ...style,
              position: "absolute",
              width: "15vw",
              top: modalPos.y,
              left: modalPos.x,
              margin: 0,
              backgroundColor: "#fff",
              borderRadius: "0.3rem",
              boxShadow: "0 2px 10px rgba(0,0,0,0.2)"
            }}
          >
            {children}
          </div>
        )}
      >
        <Modal.Header
          //  closeButton
          onMouseDown={onHeaderMouseDown}
          style={{ cursor: "move" }}
        >
          <Modal.Title style={{ flex: 1, margin: 0 }}>
            {isGroupMode
              ? "Move Group"
              : `Edit Item #${selectedGroupIdx}:${selectedInstIdx}`}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedGroupId && (
            <Button
              variant="link"
              size="sm"
              onClick={() => {
                const nextMode = !isGroupMode;
                // reseteljük az összes highlight-ot
                Object.values(groupNodesRef.current).forEach((node) =>
                  node
                    .getChildMeshes()
                    .forEach(
                      (m) =>
                        (m.material.diffuseColor = new Color3(0.7, 0.7, 0.7))
                    )
                );
                if (nextMode) {
                  // csoport mód: highlight a kijelölt csoport
                  groupNodesRef.current[selectedGroupId]
                    ?.getChildMeshes()
                    .forEach(
                      (m) => (m.material.diffuseColor = new Color3(1, 5, 0))
                    );
                } else {
                  // single mód: a selectedGroupIdx/InstIdx értékeket használjuk
                  const gIdx = selectedGroupIdx;
                  const iIdx = selectedInstIdx;
                  if (gIdx == null || iIdx == null) return;
                  // sliders alapértékének beállítása
                  const pos = parseBracketList(
                    createdItems[gIdx].position,
                    createdItems[gIdx].qty
                  )[iIdx];
                  setItemPosition({ x: pos[0], y: pos[1], z: pos[2] });
                  const rot = parseBracketList(
                    createdItems[gIdx].rotation,
                    createdItems[gIdx].qty
                  )[iIdx];
                  setItemRotation({ x: rot[0], y: rot[1], z: rot[2] });
                  // single mesh highlight
                  const mesh = sceneRef.current.getMeshByName(
                    `box_${gIdx}_${iIdx}`
                  );
                  mesh?.material &&
                    (mesh.material.diffuseColor = new Color3(1, 5, 0));
                }
                setIsGroupMode(nextMode);
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                fontSize: "1.1rem",
                padding: "0.5rem 1rem",
                borderRadius: "0.25rem",
                border: "1px solid #ccc",
                marginBottom: "1rem",
                transition:
                  "background-color 0.15s ease, border-color 0.15s ease"
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#f7f7f7")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#fff")
              }
            >
              <IonIcon
                icon={isGroupMode ? documentsOutline : documentOutline}
                style={{ fontSize: "1.3rem", verticalAlign: "middle" }}
              />
              <span style={{ marginLeft: 8, verticalAlign: "middle" }}>
                {isGroupMode ? "Group" : "Single"}
              </span>
            </Button>
          )}
          {/* …pozíció‐sliderek… */}
          {["x", "y", "z"].map((ax) => (
            <div key={ax} style={{ marginBottom: 12 }}>
              <label>{`${ax.toUpperCase()}: ${
                isGroupMode ? groupDelta[ax] : itemPosition[ax]
              }`}</label>
              <input
                type="range"
                min={isGroupMode ? -2500 : ax === "y" ? 0 : -2500}
                max={2500}
                value={isGroupMode ? groupDelta[ax] : itemPosition[ax]}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (isGroupMode) setGroupDelta((p) => ({ ...p, [ax]: val }));
                  else setItemPosition((p) => ({ ...p, [ax]: val }));
                }}
                style={{ width: "100%" }}
              />
            </div>
          ))}

          {/* csak csoportnál mutatjuk a forgatást */}
          {["x", "y", "z"].map((ax) => (
            <div key={`r${ax}`} style={{ marginBottom: 12 }}>
              <label>
                {`Rot ${ax.toUpperCase()}: ${
                  isGroupMode ? groupRotation[ax] : itemRotation[ax]
                }`}
              </label>
              <input
                type="range"
                min={-2}
                max={2}
                step={1}
                value={isGroupMode ? groupRotation[ax] : itemRotation[ax]}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  // setGroupRotation(p=>({...p,[ax]:val}));
                  if (isGroupMode) {
                    setGroupRotation((p) => ({ ...p, [ax]: val }));
                  } else {
                    setItemRotation((p) => ({ ...p, [ax]: val }));
                  }
                }}
                style={{ width: "100%" }}
              />
            </div>
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

// Helpers
function parseSizeString(input) {
  if (Array.isArray(input)) {
    const nums = input.map((n) => parseFloat(n) || 0);
    return nums.length === 3 ? nums : [1, 1, 1];
  }
  if (typeof input != "string") return [1, 1, 1];
  return input
    .slice(1, -1)
    .split(",")
    .map((n) => parseFloat(n) || 0);
}
function parseBracketList(input = "", qty) {
  if (Array.isArray(input))
    return input
      .slice(0, qty)
      .map((a) =>
        Array.isArray(a) ? a.map((n) => parseFloat(n) || 0) : [0, 0, 0]
      );
  const matches = (input.match(/\[.*?\]/g) || []).slice(0, qty);
  return Array.from({ length: qty }, (_, i) => {
    const m = matches[i];
    return m
      ? m
          .slice(1, -1)
          .split(",")
          .map((n) => parseFloat(n) || 0)
      : [0, 0, 0];
  });
}
