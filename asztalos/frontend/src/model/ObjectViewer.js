// ObjectViewer.js
import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { Engine, Scene, Vector3, MeshBuilder, StandardMaterial, Color3, ArcRotateCamera, HemisphericLight, Tools, ActionManager, ExecuteCodeAction, Mesh } from "@babylonjs/core";
import { getAllCreatedItems, getAllObjects } from "../data/getters";
import { updateItems } from "../data/store/actions/objectStoreFunctions";

const ObjectViewer = ({ objectId }) => {
  const dispatch = useDispatch();
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const objectMeshesRef = useRef({});
  const objectParentsRef = useRef({});
  const [objectData, setObjectData] = useState(null);
  const [createdItems, setCreatedItems] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [itemPosition, setItemPosition] = useState({ x: 0, y: 0, z: 0 });
  const [itemRotation, setItemRotation] = useState({ x: 0, y: 0, z: 0 });
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // Load object and its created items
  useEffect(() => {
    const fetchData = async () => {
      console.log("Fetching data for objectId:", objectId, "Type:", typeof objectId);
      const allObjects = await dispatch(getAllObjects());
      console.log("All objects:", allObjects);

      const normalizedObjectId = typeof objectId === "string" ? parseInt(objectId, 10) : objectId;
      const selectedObject = allObjects.find(obj => obj.objectId === normalizedObjectId);
      console.log("Selected object:", selectedObject);
      setObjectData(selectedObject);

      const allItems = await dispatch(getAllCreatedItems());
      console.log("All created items:", allItems);
      const filteredItems = allItems.filter(item => item.object.objectId === normalizedObjectId);
      console.log("Filtered items:", filteredItems);
      setCreatedItems(filteredItems);
    };

    fetchData();
  }, [dispatch, objectId]);

  // Initialize Babylon.js scene
  useEffect(() => {
    if (!canvasRef.current) {
      console.error("Canvas ref is null");
      return;
    }

    console.log("Initializing Babylon.js scene");
    const engine = new Engine(canvasRef.current, true);
    const scene = new Scene(engine);
    sceneRef.current = scene;

    scene.clearColor = new Color3(0.9, 0.9, 0.9);

    const camera = new ArcRotateCamera(
      "camera",
      Math.PI / 2,
      Math.PI / 4,
      2000,
      new Vector3(0, 0, 0),
      scene
    );
    camera.attachControl(canvasRef.current, true, false, false);
    camera.wheelPrecision = 0.1;
    cameraRef.current = camera;

    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

    engine.runRenderLoop(() => {
      scene.render();
    });

    return () => {
      console.log("Cleaning up Babylon.js scene");
      engine.dispose();
    };
  }, []);

  // Render the selected object and center the camera
  useEffect(() => {
    if (!sceneRef.current || !objectData || !createdItems.length) {
      console.log("Render skipped - Missing data:", {
        scene: !!sceneRef.current,
        objectData: !!objectData,
        createdItems: createdItems.length,
      });
      return;
    }

    console.log("Rendering object with ID:", objectId);
    const scene = sceneRef.current;
    objectMeshesRef.current = {};
    objectParentsRef.current = {};

    const objPosition = objectData.position && objectData.position.trim() !== "" 
      ? parsePositionString(objectData.position, 1)[0] 
      : [0, 0, 0];
    const objRotation = objectData.rotation && objectData.rotation.trim() !== "" 
      ? parseRotationString(objectData.rotation, 1)[0] 
      : [0, 0, 0];

    const parentMesh = new Mesh(`parent_${objectId}`, scene);
    parentMesh.position = new Vector3(objPosition[0], objPosition[1], objPosition[2]);
    parentMesh.rotation = new Vector3(
      Tools.ToRadians(objRotation[0]),
      Tools.ToRadians(objRotation[1]),
      Tools.ToRadians(objRotation[2])
    );
    objectParentsRef.current[objectId] = parentMesh;
    objectMeshesRef.current[objectId] = [];

    createdItems.forEach(item => {
      const size = parseSizeString(item.size);
      const positions = parsePositionString(item.position, item.qty);
      const rotations = parseRotationString(item.rotation, item.qty);

      console.log("Rendering item:", item.name, "with qty:", item.qty);
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

          mesh.metadata = { itemId: item.itemId, index: index };

          objectMeshesRef.current[objectId].push(mesh);

          mesh.actionManager = new ActionManager(scene);
          mesh.actionManager.registerAction(
            new ExecuteCodeAction(ActionManager.OnLeftPickTrigger, () => {
              const itemId = mesh.metadata.itemId;
              if (selectedItemId === itemId) {
                setSelectedItemId(null);
                setIsPanelOpen(false);
                mesh.material.diffuseColor = new Color3(0, 0, 0);
              } else {
                if (selectedItemId) {
                  const prevSelectedMesh = objectMeshesRef.current[objectId].find(
                    m => m.metadata.itemId === selectedItemId
                  );
                  if (prevSelectedMesh) {
                    prevSelectedMesh.material.diffuseColor = new Color3(0, 0, 0);
                  }
                }
                setSelectedItemId(itemId);
                setItemPosition({
                  x: mesh.position.x,
                  y: mesh.position.y,
                  z: mesh.position.z,
                });
                setItemRotation({
                  x: Tools.ToDegrees(mesh.rotation.x),
                  y: Tools.ToDegrees(mesh.rotation.y),
                  z: Tools.ToDegrees(mesh.rotation.z),
                });
                setIsPanelOpen(true);
                mesh.material.diffuseColor = new Color3(1, 0, 0);
              }
            })
          );

          mesh.actionManager.registerAction(
            new ExecuteCodeAction(ActionManager.OnPointerOverTrigger, () => {
              if (mesh.metadata.itemId !== selectedItemId) {
                mesh.material.diffuseColor = new Color3(0, 1, 0);
              }
            })
          );
          mesh.actionManager.registerAction(
            new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, () => {
              if (mesh.metadata.itemId !== selectedItemId) {
                mesh.material.diffuseColor = new Color3(0, 0, 0);
              }
            })
          );
        });
      }
    });

    if (cameraRef.current) {
      cameraRef.current.setTarget(parentMesh.position);
    }
  }, [objectData, createdItems, objectId]);

  // Update selected item position and rotation
  useEffect(() => {
    if (!selectedItemId || !objectMeshesRef.current[objectId]) return;

    const selectedMesh = objectMeshesRef.current[objectId].find(
      mesh => mesh.metadata.itemId === selectedItemId
    );
    if (selectedMesh) {
      selectedMesh.position = new Vector3(itemPosition.x, itemPosition.y, itemPosition.z);
      selectedMesh.rotation = new Vector3(
        Tools.ToRadians(itemRotation.x),
        Tools.ToRadians(itemRotation.y),
        Tools.ToRadians(itemRotation.z)
      );
      selectedMesh.material.diffuseColor = new Color3(1, 0, 0);
      console.log("Updated item rotation Y:", itemRotation.y, "radians:", Tools.ToRadians(itemRotation.y));
    }
  }, [itemPosition, itemRotation, selectedItemId, objectId]);

  // Save the modified item to the store
  const handleSave = () => {
    if (!selectedItemId || !objectMeshesRef.current[objectId]) return;

    const selectedMesh = objectMeshesRef.current[objectId].find(
      mesh => mesh.metadata.itemId === selectedItemId
    );
    if (selectedMesh) {
      const originalItem = createdItems.find(item => item.itemId === selectedItemId);
      if (originalItem) {
        const updatedItem = {
          ...originalItem,
          position: `[${itemPosition.x}, ${itemPosition.y}, ${itemPosition.z}]`,
          rotation: `[${itemRotation.x}, ${itemRotation.y}, ${itemRotation.z}]`,
        };
        console.log("Saving updated item:", updatedItem);
        dispatch(updateItems(updatedItem)); // UPDATE_ITEMS action hívása
      }
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
      {isPanelOpen && (
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
          <h3 style={{ marginBottom: "15px" }}>Item Position & Rotation</h3>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>Left/Right (X):</label>
            <input
              type="range"
              min="-2500"
              max="2500"
              value={itemPosition.x}
              onChange={(e) => setItemPosition({ ...itemPosition, x: parseFloat(e.target.value) })}
              style={{ width: "100%" }}
            />
            <span style={{ display: "block", textAlign: "center" }}>{itemPosition.x} mm</span>
          </div>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>Up/Down (Y):</label>
            <input
              type="range"
              min="0"
              max="2500"
              value={itemPosition.y}
              onChange={(e) => setItemPosition({ ...itemPosition, y: parseFloat(e.target.value) })}
              style={{ width: "100%" }}
            />
            <span style={{ display: "block", textAlign: "center" }}>{itemPosition.y} mm</span>
          </div>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>Forward/Back (Z):</label>
            <input
              type="range"
              min="-2500"
              max="2500"
              value={itemPosition.z}
              onChange={(e) => setItemPosition({ ...itemPosition, z: parseFloat(e.target.value) })}
              style={{ width: "100%" }}
            />
            <span style={{ display: "block", textAlign: "center" }}>{itemPosition.z} mm</span>
          </div>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>Rotate X:</label>
            <input
              type="range"
              min="-180"
              max="180"
              value={itemRotation.x}
              onChange={(e) => setItemRotation({ ...itemRotation, x: parseFloat(e.target.value) })}
              style={{ width: "100%" }}
            />
            <span style={{ display: "block", textAlign: "center" }}>{itemRotation.x}°</span>
          </div>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>Rotate Y:</label>
            <input
              type="range"
              min="-180"
              max="180"
              value={itemRotation.y}
              onChange={(e) => setItemRotation({ ...itemRotation, y: parseFloat(e.target.value) })}
              style={{ width: "100%" }}
            />
            <span style={{ display: "block", textAlign: "center" }}>{itemRotation.y}°</span>
          </div>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>Rotate Z:</label>
            <input
              type="range"
              min="-180"
              max="180"
              value={itemRotation.z}
              onChange={(e) => setItemRotation({ ...itemRotation, z: parseFloat(e.target.value) })}
              style={{ width: "100%" }}
            />
            <span style={{ display: "block", textAlign: "center" }}>{itemRotation.z}°</span>
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

export default ObjectViewer;