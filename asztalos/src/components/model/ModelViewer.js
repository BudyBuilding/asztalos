import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import * as TWEEN from "@tweenjs/tween.js";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { DragControls } from "three/examples/jsm/controls/DragControls"; // Importáljuk a DragControls modult
import store from "../data/store/store";
import { modifyObject } from "../data/firebase/apiService";

function ModelViewer() {
  const dispatch = useDispatch();
  const mountRef = useRef(null);
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const furnitureData = useSelector((state) => state.objects);
  const selectedObject = useSelector((state) => state.selectedObject);
  const MM_TO_M = 0.003;

  let roomHeight = 2000 * MM_TO_M;
  let roomWidth = 5000 * MM_TO_M;
  let roomDepth = 2500 * MM_TO_M;
  let offsetX = -roomWidth / 2;
  let offsetZ = -roomDepth / 2;
  let offsetY = roomHeight / 2;

  useEffect(() => {
    store.subscribe(() => {
      //    console.log("State changed:", store.getState());
    });
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xeeeeee);

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 9, 12);
    let currentPosition = new THREE.Vector3(0, 0, 0);
    let furnitureMeshes = [];
    let maxRowHeight = 0;
    if (furnitureData) {
      furnitureData.forEach((item) => {
        if (item.name !== "All") {
          if (item.key == selectedObject || selectedObject == 0) {
            const { values } = item;
            const { width, height, depth } = values.size;
            const convertedWidth = width * MM_TO_M;
            const convertedHeight = height * MM_TO_M;
            const convertedDepth = depth * MM_TO_M;

            const cabinetGeometry = new THREE.BoxGeometry(
              convertedWidth,
              convertedHeight,
              convertedDepth
            );
            const cabinetEdges = new THREE.EdgesGeometry(cabinetGeometry);
            const cabinetLine = new THREE.LineSegments(
              cabinetEdges,
              new THREE.LineBasicMaterial({ color: 0x8b4513 })
            );

            cabinetLine.userData.key = item.key;

            const doorGeometry = new THREE.BoxGeometry(
              convertedWidth / 2,
              convertedHeight,
              18 * MM_TO_M
            );
            const doorEdges = new THREE.EdgesGeometry(doorGeometry);
            const doorLine1 = new THREE.LineSegments(
              doorEdges,
              new THREE.LineBasicMaterial({ color: 0x8b4513 })
            );
            const doorLine2 = new THREE.LineSegments(
              doorEdges,
              new THREE.LineBasicMaterial({ color: 0x8b4513 })
            );

            doorLine1.position.set(-convertedWidth / 4, 0, convertedDepth / 2);
            doorLine2.position.set(convertedWidth / 4, 0, convertedDepth / 2);

            doorLine1.userData.isDoor = true;
            doorLine2.userData.isDoor = true;

            cabinetLine.add(doorLine1);
            cabinetLine.add(doorLine2);

            const shelfFrameGeometry = new THREE.BoxGeometry(
              convertedWidth,
              convertedDepth,
              18 * MM_TO_M
            );

            const shelfEdges = new THREE.EdgesGeometry(shelfFrameGeometry);

            const shelfFrame = new THREE.LineSegments(
              shelfEdges,
              new THREE.LineBasicMaterial({ color: 0x8b4513 })
            );

            shelfFrame.rotateX(1.55);
            cabinetLine.add(shelfFrame);

            cabinetLine.position.set(
              values.position.x * MM_TO_M,
              values.position.y * MM_TO_M,
              values.position.z * MM_TO_M
            );
            cabinetLine.rotation.set(
              (values.rotation.x * Math.PI) / 180,
              (values.rotation.y * Math.PI) / 180,
              (values.rotation.z * Math.PI) / 180
            );
            furnitureMeshes.push(cabinetLine);
            scene.add(cabinetLine);
          }
        }
      });
    }
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    const roomGeometry = new THREE.BoxGeometry(
      roomWidth,
      roomHeight,
      roomDepth
    );
    const roomMaterial = new THREE.EdgesGeometry(roomGeometry);
    const room = new THREE.LineSegments(
      roomMaterial,
      new THREE.LineBasicMaterial({ color: 0x00000 })
    );
    scene.add(room);

    const light = new THREE.PointLight(0xffffff, 1, 100);
    light.position.set(5, 5, 5);
    scene.add(light);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.update();

    const dragControls = new DragControls(
      furnitureMeshes, // Csak a bútorok mesh-ei
      camera,
      renderer.domElement
    );
    dragControls.addEventListener("dragstart", function (event) {
      controls.enabled = false;
    });

    dragControls.addEventListener("dragend", function (event) {
      controls.enabled = true;

      const draggedObject = event.object; // A húzott objektum
      const draggedObjectKey = draggedObject.userData.key; // A húzott objektum azonosítója

      if (draggedObjectKey) {
        // A húzott objektum lekérése az objects tömbből az azonosító alapján
        const draggedObjectData = furnitureData.find(
          (obj) => obj.key === draggedObjectKey
        );
        console.log(draggedObjectData.values.position);
        const newPosition = draggedObject.position.clone(); // Az új pozíció
        const newRotation = draggedObject.rotation.clone(); // Az új forgatás

        const modifiedPosition = {
          x: newPosition.x / MM_TO_M,
          y: newPosition.y / MM_TO_M,
          z: newPosition.z / MM_TO_M,
        };

        const modifiedRotation = {
          x: THREE.MathUtils.radToDeg(newRotation.x),
          y: THREE.MathUtils.radToDeg(newRotation.y),
          z: THREE.MathUtils.radToDeg(newRotation.z),
        };

        const modifiedObject = {
          ...draggedObjectData,
          values: {
            ...draggedObjectData.values,
            position: modifiedPosition,
            rotation: modifiedRotation,
          },
        };

        console.log(modifiedPosition);

        // Az objektum módosított változatának dispatchelése a store-ba
        dispatch(modifyObject(modifiedObject));
      }
    });

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
        window.removeEventListener("resize", handleResize);
      }
    };
  }, [furnitureData, selectedObject, store]);

  return <div ref={mountRef} style={{ width: "100%", height: "100vh" }} />;
}

export default ModelViewer;
