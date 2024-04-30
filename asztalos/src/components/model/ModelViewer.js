import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import * as TWEEN from "@tweenjs/tween.js";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

function ModelViewer() {
  const mountRef = useRef(null);
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const furnitureData = useSelector((state) => state.objects);
  const selectedObject = useSelector((state) => state.selectedObject);
  const MM_TO_M = 0.003;

  // Room dimensions and initial offsets
  let roomHeight = 2000 * MM_TO_M;
  let roomWidth = 5000 * MM_TO_M;
  let roomDepth = 2500 * MM_TO_M;
  let offsetX = -roomWidth / 2;
  let offsetZ = -roomDepth / 2;
  let offsetY = roomHeight / 2;

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xeeeeee);

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 7);
    let currentPosition = new THREE.Vector3(0, 0, 0);

    let maxRowHeight = 0; // Maximum row height
    if (furnitureData) {
      furnitureData.forEach((item) => {
        if (item.name !== "All") {
          console.log(selectedObject);
          if (item.key == selectedObject || selectedObject == 0) {
            const { values } = item;
            const { width, height, depth } = values.size;
            const convertedWidth = width * MM_TO_M;
            const convertedHeight = height * MM_TO_M;
            const convertedDepth = depth * MM_TO_M;

            // Creating cabinet frame
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

            // Creating door frames
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

            // Closed position
            doorLine1.position.set(-convertedWidth / 4, 0, convertedDepth / 2);
            doorLine2.position.set(convertedWidth / 4, 0, convertedDepth / 2);

            // Labeling the door objects for identification
            doorLine1.userData.isDoor = true;
            doorLine2.userData.isDoor = true;

            cabinetLine.add(doorLine1);
            cabinetLine.add(doorLine2);

            // Adding shelves
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

            // Setting position

            cabinetLine.position.x = offsetX + convertedWidth / 2;
            cabinetLine.position.z = offsetZ + convertedDepth / 2;
            cabinetLine.position.y = offsetY - convertedDepth * 1.5;
            currentPosition.x += convertedWidth;
            const margin = 0.05;

            if (convertedHeight > maxRowHeight) {
              maxRowHeight = convertedHeight;
            }

            if (currentPosition.x + convertedWidth > window.innerWidth) {
              currentPosition.x = 0;
              currentPosition.y -= maxRowHeight;
              maxRowHeight = convertedHeight;
            }

            offsetX += convertedWidth + margin;
            if (offsetX + convertedWidth > window.innerWidth) {
              offsetX = 0;
              offsetY += convertedHeight + margin;
            }

            scene.add(cabinetLine);
          }
        }
      });
    }
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Room frame
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

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.update();

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      TWEEN.update();
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
        // Ha a mountRef.current nem null, akkor hajtsd végre az eltávolítást
        mountRef.current.removeChild(renderer.domElement);
        window.removeEventListener("resize", handleResize);
      }
    };
  }, [furnitureData, selectedObject]);

  return <div ref={mountRef} style={{ width: "100%", height: "100vh" }} />;
}

export default ModelViewer;
