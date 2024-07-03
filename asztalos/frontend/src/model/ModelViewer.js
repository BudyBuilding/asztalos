import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { DragControls } from "three/examples/jsm/controls/DragControls";
import {
  getAllCreatedItems,
  getAllObjects,
  getObjectById,
} from "../data/getters";

const ModelViewer = ({ objectId }) => {
  const dispatch = useDispatch();
  const [createdItems, setCreatedItems] = useState([]);
  const [boxes, setBoxes] = useState([]);
  const [objects, setObjects] = useState([]);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const sceneRef = useRef(new THREE.Scene());
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);

  useEffect(() => {
    const fetchItems = async () => {
      const items = await dispatch(getAllCreatedItems());
      setCreatedItems(items);
    };

    const fetchObjects = async () => {
      const objects = await dispatch(getAllObjects());
      setObjects(objects);
    };

    fetchItems();
    fetchObjects();
  }, [dispatch]);

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
    rendererRef.current = renderer;

    if (canvasRef.current) {
      canvasRef.current.appendChild(renderer.domElement);
    } else {
      console.error("canvasRef.current is null");
    }

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    controls.maxPolarAngle = Math.PI / 2;

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

    if (createdItems.length > 0) {
      if (objectId === "0") {
        const allBoxes = [];
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
          const objectMaterial = new THREE.MeshBasicMaterial({
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

          const currentItems = itemFilter(object.objectId, createdItems);
          const newBoxes = createObjects(object.objectId, currentItems);

          newBoxes.forEach((box) => objectBox.add(box));
          scene.add(objectBox);
          allBoxes.push(objectBox);
        });

        setBoxes(allBoxes);

        const dragControls = new DragControls(
          allBoxes,
          camera,
          renderer.domElement
        );
        dragControls.addEventListener("dragstart", function (event) {
          controls.enabled = false; // Disable OrbitControls
          event.object.material.emissive.set(0xaaaaaa); // Highlight the dragged object
        });

        dragControls.addEventListener("dragend", function (event) {
          controls.enabled = true; // Enable OrbitControls
          event.object.material.emissive.set(0x000000); // Reset the object color
        });
      } else {
        const currentItems = itemFilter(objectId, createdItems);
        const newBoxes = createObjects(objectId, currentItems);
        newBoxes.forEach((box) => scene.add(box));
        setBoxes(newBoxes);

        const dragControls = new DragControls(
          newBoxes,
          camera,
          renderer.domElement
        );
        dragControls.addEventListener("dragstart", function (event) {
          controls.enabled = false; // Disable OrbitControls
          event.object.material.emissive.set(0xaaaaaa); // Highlight the dragged object
        });

        dragControls.addEventListener("dragend", function (event) {
          controls.enabled = true; // Enable OrbitControls
          event.object.material.emissive.set(0x000000); // Reset the object color
        });
      }
    }

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
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

export default ModelViewer;

// Helper functions (ensure these are properly defined in your component or imported)
const parseStringToArray = (str) => {
  if (!str) return [0, 0, 0];
  const trimmedStr = str.replace(/[\[\]']+/g, "");
  return trimmedStr.split(",").map(Number);
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
