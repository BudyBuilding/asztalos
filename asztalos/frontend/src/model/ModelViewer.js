// ModelViewer.js
import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { Engine, Scene, Vector3, MeshBuilder, StandardMaterial, Color3, ArcRotateCamera, HemisphericLight, Tools, ActionManager, ExecuteCodeAction, Mesh } from "@babylonjs/core";
import { getAllCreatedItems, getAllObjects } from "../data/getters";
import { updateObject } from "../data/store/actions/objectStoreFunctions";

const ModelViewer = () => {
  const dispatch = useDispatch();
  const [createdItems, setCreatedItems] = useState([]);
  const [objects, setObjects] = useState([]);
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const objectMeshesRef = useRef({});
  const objectParentsRef = useRef({});
  const [selectedObjectId, setSelectedObjectId] = useState(null);
  const [objectPosition, setObjectPosition] = useState({ x: 0, y: 0, z: 0 });
  const [objectRotation, setObjectRotation] = useState({ x: 0, y: 0, z: 0 });
  const [isPanelOpen, setIsPanelOpen] = useState(false); // Hozzáadott állapot

  // Load data
  useEffect(() => {
    const fetchItems = async () => {
      const items = await dispatch(getAllCreatedItems());
      setCreatedItems(items);
      console.log("Fetched Created Items:", items);
    };

    const fetchObjects = async () => {
      const objs = await dispatch(getAllObjects());
      setObjects(objs);
      console.log("Fetched Objects:", objs);
    };

    fetchItems();
    fetchObjects();
  }, [dispatch]);

  // Initialize Babylon.js scene
  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new Engine(canvasRef.current, true);
    const scene = new Scene(engine);
    sceneRef.current = scene;

    scene.clearColor = new Color3(0.9, 0.9, 0.9);

    const camera = new ArcRotateCamera(
      "camera",
      Math.PI / 2,
      Math.PI / 4,
      10000,
      Vector3.Zero(),
      scene
    );
    camera.attachControl(canvasRef.current, true);
    camera.wheelPrecision = 0.1;
    cameraRef.current = camera;

    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

    const roomSize = 5000;
    const wallHeight = 2500;
    const wallThickness = 50;

    const floor = MeshBuilder.CreateBox("floor", { width: roomSize, height: wallThickness, depth: roomSize }, scene);
    floor.position = new Vector3(0, -wallThickness / 2, 0);
    floor.isPickable = false;
    floor.visibility = 1;

    const walls = [
      MeshBuilder.CreateBox("wall1", { width: roomSize, height: wallHeight, depth: wallThickness }, scene),
      MeshBuilder.CreateBox("wall2", { width: roomSize, height: wallHeight, depth: wallThickness }, scene),
      MeshBuilder.CreateBox("wall3", { width: wallThickness, height: wallHeight, depth: roomSize }, scene),
      MeshBuilder.CreateBox("wall4", { width: wallThickness, height: wallHeight, depth: roomSize }, scene),
    ];
    walls[0].position = new Vector3(0, wallHeight / 2, -roomSize / 2);
    walls[1].position = new Vector3(0, wallHeight / 2, roomSize / 2);
    walls[2].position = new Vector3(-roomSize / 2, wallHeight / 2, 0);
    walls[3].position = new Vector3(roomSize / 2, wallHeight / 2, 0);
    walls.forEach(wall => {
      wall.isPickable = false;
      wall.visibility = 1;
    });

    const outlineMat = new StandardMaterial("outlineMat", scene);
    outlineMat.diffuseColor = new Color3(0, 0, 0);
    outlineMat.wireframe = true;
    floor.material = outlineMat;
    walls.forEach(wall => wall.material = outlineMat);

    // Store canvas locally to avoid null reference in cleanup
    const canvas = canvasRef.current;

    // Handle right-click drag for room movement
    let isDragging = false;
    let lastX = 0;
    let lastZ = 0;

    const onPointerDown = (evt) => {
      if (evt.button === 2) { // Right click
        isDragging = true;
        lastX = evt.clientX;
        lastZ = evt.clientY;
        evt.preventDefault();
      }
    };

    const onPointerUp = (evt) => {
      if (evt.button === 2) {
        isDragging = false;
      }
    };

    const onPointerMove = (evt) => {
      if (!isDragging || !cameraRef.current) return;

      const deltaX = evt.clientX - lastX;
      const deltaZ = evt.clientY - lastZ;

      cameraRef.current.position.x -= deltaX * 2;
      cameraRef.current.position.z -= deltaZ * 2;
      cameraRef.current.setTarget(new Vector3(cameraRef.current.position.x, 0, cameraRef.current.position.z));

      lastX = evt.clientX;
      lastZ = evt.clientY;
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("contextmenu", (evt) => evt.preventDefault());

    engine.runRenderLoop(() => {
      scene.render();
    });

    return () => {
      if (canvas) {
        canvas.removeEventListener("pointerdown", onPointerDown);
        canvas.removeEventListener("pointerup", onPointerUp);
        canvas.removeEventListener("pointermove", onPointerMove);
        canvas.removeEventListener("contextmenu", (evt) => evt.preventDefault());
      }
      engine.dispose();
    };
  }, []);

  // Render objects and created items
  useEffect(() => {
    if (!sceneRef.current || !objects.length || !createdItems.length) {
      console.log("Skipping render - Scene or data missing:", {
        scene: !!sceneRef.current,
        objects: objects.length,
        createdItems: createdItems.length,
      });
      return;
    }

    const scene = sceneRef.current;
    objectMeshesRef.current = {};
    objectParentsRef.current = {};

    objects.forEach(obj => {
      const objPosition = obj.position && obj.position.trim() !== "" ? parsePositionString(obj.position, 1)[0] : [0, 0, 0];
      const objRotation = obj.rotation && obj.rotation.trim() !== "" ? parseRotationString(obj.rotation, 1)[0] : [0, 0, 0];
      const filteredItems = createdItems.filter(item => item.object.objectId === obj.objectId);

      const parentMesh = new Mesh(`parent_${obj.objectId}`, scene);
      parentMesh.position = new Vector3(objPosition[0], objPosition[1], objPosition[2]);
      parentMesh.rotation = new Vector3(
        Tools.ToRadians(objRotation[0]),
        Tools.ToRadians(objRotation[1]),
        Tools.ToRadians(objRotation[2])
      );
      objectParentsRef.current[obj.objectId] = parentMesh;
      objectMeshesRef.current[obj.objectId] = [];

      filteredItems.forEach(item => {
        const size = parseSizeString(item.size);
        const positions = parsePositionString(item.position, item.qty);
        const rotations = parseRotationString(item.rotation, item.qty);

        if (item.qty > 0) {
          positions.forEach((pos, index) => {
            const mesh = MeshBuilder.CreateBox(item.name + index, {
              width: size[0],
              height: size[1],
              depth: size[2],
            }, scene);

            mesh.isPickable = true;

            const validPos = Array.isArray(pos) && pos.length === 3 ? pos : [0, 0, 0];
            mesh.position = new Vector3(validPos[0], validPos[1], validPos[2]);

            const validRot = Array.isArray(rotations[index]) && rotations[index].length === 3 ? rotations[index] : [0, 0, 0];
            mesh.rotation = new Vector3(
              Tools.ToRadians(validRot[0]),
              Tools.ToRadians(validRot[1]),
              Tools.ToRadians(validRot[2])
            );

            const mat = new StandardMaterial("itemMat" + item.itemId + index, scene);
            mat.diffuseColor = new Color3(0, 0, 0);
            mat.wireframe = true;
            mesh.material = mat;

            mesh.parent = parentMesh;

            objectMeshesRef.current[obj.objectId].push(mesh);

            mesh.actionManager = new ActionManager(scene);
            mesh.actionManager.registerAction(
              new ExecuteCodeAction(ActionManager.OnLeftPickTrigger, () => {
                if (selectedObjectId === obj.objectId) {
                  setSelectedObjectId(null);
                  setIsPanelOpen(false); // Panel bezárása
                } else {
                  setSelectedObjectId(obj.objectId);
                  setObjectPosition({ x: objPosition[0], y: objPosition[1], z: objPosition[2] });
                  setObjectRotation({ x: objRotation[0], y: objRotation[1], z: objRotation[2] });
                  setIsPanelOpen(true); // Panel megnyitása
                }
              })
            );

            mesh.actionManager.registerAction(
              new ExecuteCodeAction(ActionManager.OnPointerOverTrigger, () => {
                objectMeshesRef.current[obj.objectId].forEach(relatedMesh => {
                  relatedMesh.material.diffuseColor = new Color3(0, 1, 0);
                });
              })
            );
            mesh.actionManager.registerAction(
              new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, () => {
                objectMeshesRef.current[obj.objectId].forEach(relatedMesh => {
                  relatedMesh.material.diffuseColor = new Color3(0, 0, 0);
                });
              })
            );
          });
        }
      });
    });
  }, [objects, createdItems]);

  // Update object position and rotation based on sliders
  useEffect(() => {
    if (selectedObjectId === null || !objectParentsRef.current[selectedObjectId]) return;

    const parentMesh = objectParentsRef.current[selectedObjectId];
    parentMesh.position = new Vector3(objectPosition.x, objectPosition.y, objectPosition.z);
    parentMesh.rotation = new Vector3(
      Tools.ToRadians(objectRotation.x),
      Tools.ToRadians(objectRotation.y),
      Tools.ToRadians(objectRotation.z)
    );
  }, [objectPosition, objectRotation, selectedObjectId]);

  // Save the modified object to the store
  const handleSave = () => {
    if (!selectedObjectId || !objectParentsRef.current[selectedObjectId]) return;

    const parentMesh = objectParentsRef.current[selectedObjectId];
    const originalObject = objects.find(obj => obj.objectId === selectedObjectId);
    if (originalObject) {
      const updatedObject = {
        ...originalObject,
        position: `[${objectPosition.x}, ${objectPosition.y}, ${objectPosition.z}]`,
        rotation: `[${objectRotation.x}, ${objectRotation.y}, ${objectRotation.z}]`,
      };
      console.log("Saving updated object:", updatedObject);
      dispatch(updateObject(updatedObject));
    }
  };

  const parsePositionString = (posString, qty) => {
    if (!posString || typeof posString !== "string" || posString.trim() === "") return [[0, 0, 0]];
    const matches = posString.match(/\[.*?\]/g) || [];
    const parsed = matches.slice(0, qty).map(match => {
      const nums = match.slice(1, -1).split(",").map(num => parseFloat(num.trim()) || 0);
      return nums.length === 3 ? nums : [0, 0, 0];
    });
    return parsed.length > 0 ? parsed : [[0, 0, 0]];
  };

  const parseRotationString = (rotString, qty) => {
    if (!rotString || typeof rotString !== "string" || rotString.trim() === "") return [[0, 0, 0]];
    const matches = rotString.match(/\[.*?\]/g) || [];
    const parsed = matches.slice(0, qty).map(match => {
      const nums = match.slice(1, -1).split(",").map(num => parseFloat(num.trim()) || 0);
      return nums.length === 3 ? nums : [0, 0, 0];
    });
    return parsed.length > 0 ? parsed : [[0, 0, 0]];
  };

  const parseSizeString = (sizeString) => {
    if (!sizeString || typeof sizeString !== "string" || sizeString.trim() === "") return [1, 1, 1];
    const nums = sizeString.slice(1, -1).split(",").map(num => parseFloat(num.trim()) || 1);
    return nums.length === 3 ? nums : [1, 1, 1];
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          margin: 0,
          padding: 0,
          display: "block",
        }}
      />
      {isPanelOpen && ( // Panel megjelenítése az isPanelOpen alapján
        <div
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            background: "white",
            padding: "15px",
            border: "1px solid #ccc",
            borderRadius: "5px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
            width: "250px",
          }}
        >
          <h3 style={{ marginBottom: "15px" }}>Position & Rotation Control</h3>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>Left/Right (X):</label>
            <input
              type="range"
              min="-2500"
              max="2500"
              value={objectPosition.x}
              onChange={(e) => setObjectPosition({ ...objectPosition, x: parseFloat(e.target.value) })}
              style={{ width: "100%" }}
            />
            <span style={{ display: "block", textAlign: "center" }}>{objectPosition.x} mm</span>
          </div>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>Up/Down (Y):</label>
            <input
              type="range"
              min="0"
              max="2500"
              value={objectPosition.y}
              onChange={(e) => setObjectPosition({ ...objectPosition, y: parseFloat(e.target.value) })}
              style={{ width: "100%" }}
            />
            <span style={{ display: "block", textAlign: "center" }}>{objectPosition.y} mm</span>
          </div>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>Forward/Back (Z):</label>
            <input
              type="range"
              min="-2500"
              max="2500"
              value={objectPosition.z}
              onChange={(e) => setObjectPosition({ ...objectPosition, z: parseFloat(e.target.value) })}
              style={{ width: "100%" }}
            />
            <span style={{ display: "block", textAlign: "center" }}>{objectPosition.z} mm</span>
          </div>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>Rotate X:</label>
            <input
              type="range"
              min="-180"
              max="180"
              value={objectRotation.x}
              onChange={(e) => setObjectRotation({ ...objectRotation, x: parseFloat(e.target.value) })}
              style={{ width: "100%" }}
            />
            <span style={{ display: "block", textAlign: "center" }}>{objectRotation.x}°</span>
          </div>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>Rotate Y:</label>
            <input
              type="range"
              min="-180"
              max="180"
              value={objectRotation.y}
              onChange={(e) => setObjectRotation({ ...objectRotation, y: parseFloat(e.target.value) })}
              style={{ width: "100%" }}
            />
            <span style={{ display: "block", textAlign: "center" }}>{objectRotation.y}°</span>
          </div>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>Rotate Z:</label>
            <input
              type="range"
              min="-180"
              max="180"
              value={objectRotation.z}
              onChange={(e) => setObjectRotation({ ...objectRotation, z: parseFloat(e.target.value) })}
              style={{ width: "100%" }}
            />
            <span style={{ display: "block", textAlign: "center" }}>{objectRotation.z}°</span>
          </div>
          <button
            onClick={handleSave}
            style={{
              width: "100%",
              padding: "10px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
};

export default ModelViewer;