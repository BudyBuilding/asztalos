import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import {
  getAllCreatedItems,
  getAllObjects,
} from "../data/getters";

export const ModelViewer = ({ objectId }) => {
  const dispatch = useDispatch();
  const [createdItems, setCreatedItems] = useState([]);
  const [objects, setObjects] = useState([]);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const sceneRef = useRef(new THREE.Scene());
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);

  // Fetch data on mount
  useEffect(() => {
    const fetchItems = async () => {
      const items = await dispatch(getAllCreatedItems());
      setCreatedItems(items);
      console.log(items);
    };

    const fetchObjects = async () => {
      const objs = await dispatch(getAllObjects());
      setObjects(objs);
      console.log(objs);
    };

    fetchItems();
    fetchObjects();
  }, [dispatch]);

  // Initialize scene, camera, and renderer
  useEffect(() => {
    const scene = sceneRef.current;
    scene.background = new THREE.Color(0xfffff0);

    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current
        ? containerRef.current.clientWidth / containerRef.current.clientHeight
        : 1,
      0.5,
      100000
    );
    camera.position.set(0, 100, 900);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      containerRef.current
        ? containerRef.current.clientWidth
        : window.innerWidth,
      containerRef.current
        ? containerRef.current.clientHeight
        : window.innerHeight
    );
    renderer.shadowMap.enabled = true; // Enable shadows
    rendererRef.current = renderer;

    if (canvasRef.current) {
      canvasRef.current.appendChild(renderer.domElement);
    } else {
      console.error("canvasRef.current is null");
    }

    // Add lights
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    controls.maxPolarAngle = Math.PI / 2;

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;

      camera.aspect =
        containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(
        containerRef.current.clientWidth,
        containerRef.current.clientHeight
      );
    };

    window.addEventListener("resize", handleResize);

    // Render the scene once (no animation loop)
    renderer.render(scene, camera);

    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, []);

  // Update objects in the scene
  useEffect(() => {
    const scene = sceneRef.current;

    // Clear existing objects
    const clearScene = () => {
      while (scene.children.length > 0) {
        const object = scene.children[0];
        scene.remove(object);
        if (object.geometry) object.geometry.dispose();
        if (object.material) object.material.dispose();
      }
    };

    if (createdItems.length > 0) {
      clearScene();

      if (objectId === "0") {
        // Show all objects
        objects.forEach((object) => {
          const objectSize = parseStringToArray(object.size);
          const objectPosition = parseStringToArray(object.position);
          const objectRotation = convertToRadians(
            parseStringToArray(object.rotation)
          );

          const objectGeometry = new THREE.BoxGeometry(
            objectSize[0],
            objectSize[1],
            objectSize[2]
          );
          const objectMaterial = new THREE.MeshLambertMaterial({
            color: 0x00ff00,
          });
          const objectBox = new THREE.Mesh(objectGeometry, objectMaterial);
          objectBox.position.set(
            objectPosition[0],
            objectPosition[1],
            objectPosition[2]
          );
          objectBox.rotation.set(
            objectRotation[0],
            objectRotation[1],
            objectRotation[2]
          );
          objectBox.castShadow = true;
          objectBox.receiveShadow = true;

          scene.add(objectBox);
        });
      } else {
        // Show selected object
        const currentItems = itemFilter(objectId, createdItems);
        const newBoxes = createObjects(objectId, currentItems);
        newBoxes.forEach((box) => scene.add(box));
      }

      // Render updated scene
      const renderer = rendererRef.current;
      const camera = cameraRef.current;
      renderer.render(scene, camera);
    }
  }, [objectId, createdItems, objects]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", overflow: "hidden" }}
    >
      <div ref={canvasRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

// Helper functions
const parseStringToArray = (str) => {
  if (!str) return [1, 1, 1];
  const trimmedStr = str.replace(/[\[\]']+/g, "");
  return trimmedStr.split(",").map((num) => parseFloat(num) || 0);
};

const convertToRadians = (degreesArray) => {
  return degreesArray.map((degree) => degree * (Math.PI / 180));
};

const itemFilter = (objectId, createdItems) => {
  return createdItems.filter((item) => item.object.objectId === objectId);
};

const createObjects = (objectId, currentItems) => {
  return currentItems.map((currentItem) => {
    const size = parseStringToArray(currentItem.size);
    const position = parseStringToArray(currentItem.position);
    const rotation = convertToRadians(parseStringToArray(currentItem.rotation));

    const geometry = new THREE.BoxGeometry(size[0], size[1], size[2]);
    const material = new THREE.MeshLambertMaterial({ color: 0xb58868 });
    const box = new THREE.Mesh(geometry, material);
    box.position.set(position[0], position[1], position[2]);
    box.rotation.set(rotation[0], rotation[1], rotation[2]);

    box.castShadow = true;
    box.receiveShadow = true;

    return box;
  });
};

export default ModelViewer;
