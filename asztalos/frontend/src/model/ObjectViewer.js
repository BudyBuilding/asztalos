import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { DragControls } from "three/examples/jsm/controls/DragControls";

import { getAllCreatedItems, getObjectById } from "../data/getters";

function ObjectViewer({ objectId, partsAreMoving }) {
  const dispatch = useDispatch();
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const createdItems = dispatch(getAllCreatedItems());
  const objectIdRef = useRef(objectId);
  const selectedObject = dispatch(getObjectById(objectIdRef.current));

  const createdItemsRef = useRef(createdItems);
  const currentItems = createdItemsRef.current.filter(
    (item) => item.object.objectId == objectId
  );
  useEffect(() => {
    dispatch(getObjectById(objectIdRef.current));
    dispatch(getAllCreatedItems());
  }, [objectIdRef, dispatch]);

  useEffect(() => {
    const parseStringToArray = (str) => {
      if (!str) return [0, 0, 0]; // Default value if string is empty or null
      const trimmedStr = str.replace(/[\[\]']+/g, ""); // Remove brackets and quotes
      return trimmedStr.split(",").map(Number);
    };

    const convertToRadians = (degreesArray) => {
      return degreesArray.map((degree) => degree * (Math.PI / 180));
    };

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfffff0);

    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current
        ? containerRef.current.clientWidth / containerRef.current.clientHeight
        : 1,
      0.5,
      100000
    );

    camera.position.set(0, 100, 900); // Kamera pozíciója

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      containerRef.current
        ? containerRef.current.clientWidth
        : window.innerWidth,
      containerRef.current
        ? containerRef.current.clientHeight
        : window.innerHeight
    );

    if (canvasRef.current) {
      canvasRef.current.appendChild(renderer.domElement);
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

    let dragControls; // DragControls változó deklarálása

    const createObject = () => {
      console.log(currentItems);
      if (dragControls) {
        dragControls.removeEventListener("dragstart", () => {});
        dragControls.removeEventListener("dragend", () => {});
        dragControls.dispose();
      }

      while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
      }
      currentItems.forEach((currentItem) => {
        console.log(renderer);
        //console.log(currentItem);
        const size = parseStringToArray(currentItem.size);
        const position = parseStringToArray(currentItem.position);
        const rotation = convertToRadians(
          parseStringToArray(currentItem.rotation)
        );

        const geometry = new THREE.BoxGeometry(size[0], size[1], size[2]);
        const material = new THREE.MeshBasicMaterial({ color: 0xb58868 });
        const box = new THREE.Mesh(geometry, material);
        box.position.set(position[0], position[1], position[2]);
        box.rotation.set(rotation[0], rotation[1], rotation[2]);
        scene.add(box);
      });

      // Objektumok kiválasztása DragControls számára
      const objects = scene.children.filter((obj) => obj instanceof THREE.Mesh);
      if (partsAreMoving) {
        // DragControls inicializálása
        dragControls = new DragControls(objects, camera, renderer.domElement);

        // Eseményfigyelők hozzáadása a dragstart és dragend eseményekhez
        dragControls.addEventListener("dragstart", () => {
          controls.enabled = false; // Ne lehessen mozgatni az OrbitControls-szal
        });

        dragControls.addEventListener("dragend", () => {
          controls.enabled = true; // Engedélyezd újra az OrbitControls használatát
        });
      }
    };

    createObject();

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update(); // Update OrbitControls
      renderer.render(scene, camera);
    };

    animate();

    // Cleanup function
    return () => {
      if (dragControls) {
        dragControls.removeEventListener("dragstart", () => {});
        dragControls.removeEventListener("dragend", () => {});
        dragControls.dispose(); // Töröld a DragControlsot
      }
      window.removeEventListener("resize", handleResize);
      renderer.dispose(); // Clean up renderer resources
    };
  }, [objectId, selectedObject, createdItems, dispatch]); // Dependencies for useEffect

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", overflow: "hidden" }}
    >
      <div ref={canvasRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}

export default ObjectViewer;
