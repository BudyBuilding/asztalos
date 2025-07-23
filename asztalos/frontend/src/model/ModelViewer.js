// ModelViewer.js
import React, { useEffect, useRef, useState } from "react";
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
  Tools,
  TransformNode,
  PointerEventTypes
} from "@babylonjs/core";
import { Modal, Button, Form } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { getImageById } from "../data/getters";
import objectApi from "../data/api/objectApi";
import { IonIcon } from "@ionic/react";
import { refresh } from "ionicons/icons";
export default function ModelViewer({
  objects,
  createdItems,
  usedColors,
  onItemUpdate,
  onObjectUpdate,
  roomSize,
  onRoomSizeChange
}) {
  const dispatch = useDispatch();

  // selection state
  const [selectedObjectId, setSelectedObjectId] = useState(null);
  const [objPosition, setObjPosition] = useState({ x: 0, y: 0, z: 0 }); // in mm
  const [objRotation, setObjRotation] = useState({ x: 0, y: 0, z: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // store original position/rotation when opening modal
  const originalRef = useRef({
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 }
  });

  // draggable modal
  const [modalPos, setModalPos] = useState({
    x: window.innerWidth / 15,
    y: window.innerHeight / 5
  });
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, origX: 0, origY: 0 });
  const MM_TO_M = 0.001;
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

  // soften backdrop blur
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .no-blur-backdrop {
        backdrop-filter: none !important;
        background-color: rgba(0,0,0,0.7) !important;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Babylon refs
  const canvasRef = useRef();
  const sceneRef = useRef();
  const cameraRef = useRef();
  const groupRootsRef = useRef({});
  const wallsRef = useRef({});

  // 1) engine + scene + camera
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error("Canvas not found");
      return;
    }
    const engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true
    });
    const scene = new Scene(engine);
    scene.clearColor = new Color4(0.9, 0.9, 0.9, 1);
    sceneRef.current = scene;

    const camera = new ArcRotateCamera(
      "camera",
      Math.PI / 2,
      Math.PI / 4,
      10,
      new Vector3(2.5, 1, 2.5),
      scene
    );
    camera.attachControl(canvas, true);
    camera.minZ = 0.01;
    camera.lowerRadiusLimit = 2;
    camera.upperRadiusLimit = 15;
    camera.wheelPrecision = 50;
    cameraRef.current = camera;

    new HemisphericLight(
      "hemilight",
      new Vector3(0, 1, 0),
      scene
    ).intensity = 1;
    new PointLight(
      "filllight",
      new Vector3(2.5, 1, 2.5),
      scene
    ).intensity = 0.3;

    // a scene létrejötte után, például az engine.runRenderLoop() hívása elé:
    scene.onPointerObservable.add((pointerInfo) => {
      if (pointerInfo.type === PointerEventTypes.POINTERDOWN) {
        const pick = pointerInfo.pickInfo;
        // ha vagy nem ütöttünk el semmit, vagy nem box_ mesh-re kattintottunk:
        if (!pick.hit || !pick.pickedMesh.name.startsWith("box_")) {
          // töröljük az összes outline-t
          Object.values(groupRootsRef.current).forEach((root) =>
            root.getChildMeshes().forEach((m) => (m.renderOutline = false))
          );
          // töröljük a kiválasztást
          setSelectedObjectId(null);
          // ha nyitva a modal, zárjuk be visszaállítás nélkül
          setIsModalOpen(false);
        }
      }
    });

    /*
    engine.runRenderLoop(() => scene.render());
    window.addEventListener("resize", () => engine.resize());
    return () => {
      engine.dispose();
      window.removeEventListener("resize", () => engine.resize());
    };*/

    engine.runRenderLoop(() => scene.render());

    // ha a window mérete változik, igazítjuk a vászont
    const onWindowResize = () => engine.resize();
    window.addEventListener("resize", onWindowResize);

    // figyeljük a container méretének változását is

    const resizeObserver = new ResizeObserver(() => {
      // aszinkron módon, requestAnimationFrame-ben hívd meg az újraméretezést,
      // így elkerülöd a ResizeObserver loop hibát
      window.requestAnimationFrame(() => {
        engine.resize();
      });
    });
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    return () => {
      engine.dispose();
      window.removeEventListener("resize", onWindowResize);
      resizeObserver.disconnect();
    };
  }, []);

  // 2) build room, groups & items
  useEffect(() => {
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    if (!scene || !camera) return;

    // dispose old
    scene.meshes
      .filter(
        (m) =>
          m.name.startsWith("box_") ||
          m.name.startsWith("grp_") ||
          m.name.startsWith("room_")
      )
      .forEach((m) => m.dispose());
    groupRootsRef.current = {};
    wallsRef.current = {};

    // room dims in meters
    const { h: roomH, w: roomW, d: roomD } = roomSize;
    const thin = 0.00001;

    // floor
    const floor = MeshBuilder.CreateBox(
      "room_floor",
      { width: roomW, height: thin, depth: roomD },
      scene
    );
    floor.position.set(roomW / 2, thin / 2, roomD / 2);
    const floorMat = new StandardMaterial("floorMat", scene);
    floorMat.diffuseColor = new Color3(0.5, 0.5, 0.5);
    floorMat.specularColor = new Color3(0, 0, 0);
    floor.material = floorMat;

    // walls & ceiling
    const wallMat = new StandardMaterial("wallMat", scene);
    wallMat.diffuseColor = new Color3(0.95, 0.95, 0.95);
    wallMat.alpha = 0.4;
    wallMat.specularColor = new Color3(0, 0, 0);

    const createWall = (name, opts, pos) => {
      const w = MeshBuilder.CreateBox(name, opts, scene);
      w.position.set(...pos);
      w.material = wallMat;
      wallsRef.current[name] = w;
    };

    createWall("room_leftWall", { width: thin, height: roomH, depth: roomD }, [
      thin / 2,
      roomH / 2,
      roomD / 2
    ]);
    createWall("room_rightWall", { width: thin, height: roomH, depth: roomD }, [
      roomW - thin / 2,
      roomH / 2,
      roomD / 2
    ]);
    createWall("room_frontWall", { width: roomW, height: roomH, depth: thin }, [
      roomW / 2,
      roomH / 2,
      thin / 2
    ]);
    createWall("room_backWall", { width: roomW, height: roomH, depth: thin }, [
      roomW / 2,
      roomH / 2,
      roomD - thin / 2
    ]);
    createWall("room_ceiling", { width: roomW, height: thin, depth: roomD }, [
      roomW / 2,
      roomH - thin / 2,
      roomD / 2
    ]);

    // dynamic wall visibility
    scene.registerBeforeRender(() => {
      const camPos = camera.position;
      const center = new Vector3(roomW / 2, roomH / 2, roomD / 2);
      const dir = camPos.subtract(center);
      Object.values(wallsRef.current).forEach((w) => (w.isVisible = true));
      if (dir.x < 0) wallsRef.current.room_leftWall.isVisible = false;
      else wallsRef.current.room_rightWall.isVisible = false;
      if (dir.z < 0) wallsRef.current.room_frontWall.isVisible = false;
      else wallsRef.current.room_backWall.isVisible = false;
      if (dir.y > 0) wallsRef.current.room_ceiling.isVisible = false;
    });

    if (createdItems.length === 0) {
      camera.setTarget(new Vector3(roomW / 2, roomH / 2, roomD / 2));
      camera.radius = 10;
      return;
    }

    // compute scale for items
    const allSizes = createdItems.map((i) => parseSizeString(i.size));
    const maxDim = Math.max(...allSizes.flat(), 1);
    const objectScale = 0.001; //Math.min(roomW, roomD, roomH) / (maxDim * 3);

    // group roots
    createdItems.forEach((item) => {
      const oid = item.object.objectId;
      // Ha nincs még node, építsd fel:
      let root = groupRootsRef.current[oid];
      if (!root) {
        root = new TransformNode(`grp_${oid}`, scene);
        groupRootsRef.current[oid] = root;
      }

      // Mindig frissítsd a root pozícióját és rotációját:
      const objData = objects.find((o) => o.objectId === oid) || {};
      const [opx, opy, opz] = parsePositionString(
        objData.position || "[0,0,0]",
        1
      )[0];
      const [orx, ory, orz] = parseRotationString(
        objData.rotation || "[0,0,0]",
        1
      )[0];

      root.position.set(
        Math.max(0, Math.min(opx, roomW)),
        Math.max(0, Math.min(opy, roomH)),
        Math.max(0, Math.min(opz, roomD))
      );
      root.rotation.set(
        Tools.ToRadians(orx),
        Tools.ToRadians(ory),
        Tools.ToRadians(orz)
      );
    });

    // instantiate items
    createdItems.forEach((item, gi) => {
      const oid = item.object.objectId;
      const root = groupRootsRef.current[oid];
      const rawPos = parseBracketList(item.position, item.qty);
      const rawRot = parseBracketList(item.rotation, item.qty);
      const [rw, rh, rd] = parseSizeString(item.size);
      const w = rw * objectScale,
        h = rh * objectScale,
        d = rd * objectScale;

      rawPos.forEach(([x0, y0, z0], idx) => {
        const name = `box_${oid}_${gi}_${idx}`;
        const mesh = MeshBuilder.CreateBox(
          name,
          { width: w, height: h, depth: d },
          scene
        );
        mesh.parent = root;
        mesh.setPivotPoint(new Vector3(-w / 2, -h / 2, -d / 2));
        mesh.position = new Vector3(
          Math.max(w / 2, Math.min(x0 * objectScale + w / 2, roomW - w / 2)),
          Math.max(h / 2, Math.min(y0 * objectScale + h / 2, roomH - h / 2)),
          Math.max(d / 2, Math.min(z0 * objectScale + d / 2, roomD - d / 2))
        );
        const [rx, ry, rz] = rawRot[idx] || [0, 0, 0];
        mesh.rotation = new Vector3(
          (rx * Math.PI) / 2,
          (ry * Math.PI) / 2,
          (rz * Math.PI) / 2
        );

        const mat = new StandardMaterial(`mat_${name}`, scene);
        const col = usedColors.find((c) => c.colorId === item.colorId);
        if (col) {
          const img = col.imageDataReduced || col.imageData;
          if (img)
            mat.diffuseTexture = new Texture(
              `data:image/jpeg;base64,${img}`,
              scene
            );
          else mat.diffuseColor = new Color3(0.7, 0.7, 0.7);
        } else mat.diffuseColor = new Color3(0.7, 0.7, 0.7);
        mesh.material = mat;

        mesh.renderOutline = false;
        mesh.outlineWidth = 0;
        mesh.outlineColor = Color3.Green();
        mesh.actionManager = new ActionManager(scene);
        mesh.actionManager.registerAction(
          new ExecuteCodeAction(ActionManager.OnLeftPickTrigger, () => {
            // clear existing outlines
            Object.values(groupRootsRef.current).forEach((rn) =>
              rn.getChildMeshes().forEach((m) => (m.renderOutline = false))
            );
            // highlight this group
            root.getChildMeshes().forEach((m) => {
              m.renderOutline = true;
              m.outlineColor = Color3.Green();
              m.outlineWidth = 0.01;
            });
            // store originals

            originalRef.current = {
              position: {
                x: root.position.x * 1000,
                y: root.position.y * 1000,
                z: root.position.z * 1000
              },
              rotation: {
                x: Math.round(Tools.ToDegrees(root.rotation.x)),
                y: Math.round(Tools.ToDegrees(root.rotation.y)),
                z: Math.round(Tools.ToDegrees(root.rotation.z))
              }
            };

            // initialize modal state
            setObjPosition(originalRef.current.position);
            setObjRotation(originalRef.current.rotation);
            setSelectedObjectId(oid);
            setIsModalOpen(true);
          })
        );
      });
    });

    camera.setTarget(new Vector3(roomW / 2, roomH / 2, roomD / 2));
    camera.radius = 10;
  }, [objects, createdItems, usedColors, dispatch, roomSize]);

  const handlePositionChange = (ax, value) => {
    if (!selectedObjectId) return;
    setObjPosition((prev) => ({
      ...prev,
      [ax]: value
    }));
  };

  // 4) apply position transformations
  useEffect(() => {
    if (!selectedObjectId) return;
    const root = groupRootsRef.current[selectedObjectId];
    if (!root) return;
    root.position.set(
      objPosition.x / 1000,
      objPosition.y / 1000,
      objPosition.z / 1000
    );
  }, [objPosition, selectedObjectId]);

  // 5) apply rotation
  useEffect(() => {
    if (!selectedObjectId) return;
    const root = groupRootsRef.current[selectedObjectId];
    if (!root) return;
    root.rotation.set(
      Tools.ToRadians(objRotation.x),
      Tools.ToRadians(objRotation.y),
      Tools.ToRadians(objRotation.z)
    );
  }, [objRotation, selectedObjectId]);

  // cancel: restore original and close
  const handleCancel = () => {
    setObjPosition(originalRef.current.position);
    setObjRotation(originalRef.current.rotation);
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (!isModalOpen && selectedObjectId != null) {
      // visszaállítás után töröljük a kijelölést
      const root = groupRootsRef.current[selectedObjectId];
      if (root) {
        root.getChildMeshes().forEach((m) => (m.renderOutline = false));
      }
      setSelectedObjectId(null);
    }
  }, [isModalOpen, selectedObjectId]);

  // save: propagate and close
  // replace your existing handleSave with this:
  const handleSave = async () => {
    if (selectedObjectId != null) {
      const obj = objects.find((o) => o.objectId === selectedObjectId);
      if (obj) {
        const updatedObject = {
          ...obj,
          position: `[${(objPosition.x / 1000).toFixed(3)},${(
            objPosition.y / 1000
          ).toFixed(3)},${(objPosition.z / 1000).toFixed(3)}]`,
          rotation: `[${objRotation.x},${objRotation.y},${objRotation.z}]`
        };
        const objectIndex = objects.findIndex(
          (o) => o.objectId === selectedObjectId
        );
        try {
          await dispatch(
            objectApi.updateObjectApi(updatedObject.objectId, updatedObject)
          );
          onItemUpdate(updatedObject, objectIndex);
          onObjectUpdate(updatedObject, objectIndex);
        } catch (err) {
          console.error("[ModelViewer] Error updating object:", err);
        }
      }
    }
    setIsModalOpen(false);
  };
  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          backgroundColor: "rgba(255,255,255,0.8)",
          padding: "0.3rem",
          borderRadius: "0.3rem",
          display: "flex",
          gap: "0.5rem",
          zIndex: 10
        }}
      >
        {["h", "w", "d"].map((ax) => (
          <Form.Control
            key={ax}
            type="number"
            size="sm"
            style={{ width: "4rem" }}
            value={roomSize[ax]}
            onChange={(e) => onRoomSizeChange(ax, e.target.value)}
            placeholder={ax.toUpperCase()}
          />
        ))}
      </div>
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100vh", display: "block" }}
      />
      <Modal
        show={isModalOpen}
        onHide={handleCancel}
        backdropClassName="no-blur-backdrop"
        dialogAs={({
          className,
          style,
          children,
          contentClassName,
          ...props
        }) => (
          <div
            {...props} // itt már nincs contentClassName a props között
            className={className}
            style={{
              ...style,
              position: "absolute",
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
          onMouseDown={onHeaderMouseDown}
          style={{ cursor: "move" }}
        >
          <Modal.Title>Transform Object #{selectedObjectId}</Modal.Title>
        </Modal.Header>
        <Modal.Body
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center"
          }}
        >
          {["x", "y", "z"].map((ax) => {
            const min = 0;
            const max = ax === "y" ? 3000 : 5000;
            const val = objPosition[ax];
            const label = ax.toUpperCase();

            return (
              <Form.Group key={ax} className="mb-4">
                {/* felső sor: label + –, input, +, reset */}
                <div className="d-flex align-items-center mb-2">
                  <span style={{ width: 20, fontWeight: "bold" }}>
                    {label}:
                  </span>

                  {/* decrement */}
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="mx-2"
                    onClick={() => handlePositionChange(ax, val - 10)}
                  >
                    –
                  </Button>

                  {/* number input */}
                  <Form.Control
                    type="number"
                    size="sm"
                    style={{ width: 70 }}
                    min={min}
                    max={max}
                    value={val}
                    onChange={(e) => {
                      let v = Number(e.target.value);
                      if (isNaN(v)) v = min;
                      handlePositionChange(ax, v);
                    }}
                  />

                  {/* increment */}
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="ms-2"
                    onClick={() => handlePositionChange(ax, val + 10)}
                  >
                    +
                  </Button>

                  {/* reset */}
                  <div
                    variant="outline-danger"
                    size="sm"
                    className="ms-3"
                    onClick={() => handlePositionChange(ax, 0)}
                  >
                    <IonIcon icon={refresh} />
                  </div>
                </div>

                <Form.Range
                  min={min}
                  max={max}
                  step={1}
                  value={val}
                  onInput={(e) => handlePositionChange(ax, +e.target.value)}
                />
              </Form.Group>
            );
          })}

          {/* rotationök */}
          {["x", "y", "z"].map((ax) => {
            const val = objRotation[ax];
            return (
              <Form.Group key={`r${ax}`} className="mb-4">
                <div className="d-flex align-items-center mb-2">
                  <span style={{ width: 20, fontWeight: "bold" }}>
                    {ax.toUpperCase()}:
                  </span>
                  <Button
                    size="sm"
                    className="mx-2"
                    onClick={() =>
                      setObjRotation((prev) => ({
                        ...prev,
                        [ax]: prev[ax] - 10
                      }))
                    }
                  >
                    –
                  </Button>
                  <Form.Control
                    type="number"
                    size="sm"
                    style={{ width: 70 }}
                    min={0}
                    max={360}
                    value={val}
                    onChange={(e) => {
                      let v = parseInt(e.target.value, 10);
                      if (isNaN(v)) v = 0;
                      setObjRotation((prev) => ({ ...prev, [ax]: v }));
                    }}
                  />
                  <Button
                    size="sm"
                    className="ms-2"
                    onClick={() =>
                      setObjRotation((prev) => ({
                        ...prev,
                        [ax]: prev[ax] + 10
                      }))
                    }
                  >
                    +
                  </Button>
                  <div
                    size="sm"
                    className="ms-3"
                    onClick={() =>
                      setObjRotation((prev) => ({ ...prev, [ax]: 0 }))
                    }
                  >
                    <IonIcon icon={refresh} />
                  </div>
                </div>
                <Form.Range
                  min={0}
                  max={360}
                  step={1}
                  value={val}
                  onChange={(e) =>
                    setObjRotation((prev) => ({
                      ...prev,
                      [ax]: parseInt(e.target.value, 10)
                    }))
                  }
                />
              </Form.Group>
            );
          })}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Apply
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

// helper functions
function parseSizeString(input) {
  if (Array.isArray(input)) {
    const nums = input.map((n) => parseFloat(n) || 0);
    return nums.length === 3 ? nums : [1, 1, 1];
  }
  if (typeof input !== "string") return [1, 1, 1];
  return input
    .slice(1, -1)
    .split(",")
    .map((n) => parseFloat(n) || 0);
}

function parseBracketList(input = "", qty) {
  if (Array.isArray(input)) {
    return input
      .slice(0, qty)
      .map((a) =>
        Array.isArray(a) ? a.map((n) => parseFloat(n) || 0) : [0, 0, 0]
      );
  }
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

function parsePositionString(input = "", qty) {
  if (!input.trim()) return Array(qty).fill([0, 0, 0]);
  const matches = input.match(/\[.*?\]/g) || [];
  return matches.slice(0, qty).map((m) =>
    m
      .slice(1, -1)
      .split(",")
      .map((n) => parseFloat(n.trim()) || 0)
  );
}

function parseRotationString(input = "", qty) {
  if (!input.trim()) return Array(qty).fill([0, 0, 0]);
  const matches = input.match(/\[.*?\]/g) || [];
  return matches.slice(0, qty).map((m) =>
    m
      .slice(1, -1)
      .split(",")
      .map((n) => parseFloat(n.trim()) || 0)
  );
}
