import React, { useEffect, useRef } from "react";
import * as TWEEN from "@tweenjs/tween.js";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import FurnitureList from "./FurnitureList";

function createFurnitureModel(length, width, height) {
  const geometry = new THREE.BoxGeometry(length, height, width);
  const material = new THREE.MeshBasicMaterial({ color: 0x8b4513 });
  const cube = new THREE.Mesh(geometry, material);
  return cube;
}

function ModelViewer({ data }) {
  const mountRef = useRef(null);
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const controlsRef = useRef(null);
  const sceneRef = useRef(null);

  useEffect(() => {
    if (!data || !data.items) {
      console.log("no data");
      return;
    }

    console.log(data);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xeeeeee);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controlsRef.current = controls;

    const furnitureModels = Object.values(data.items).map((item) => {
      return createFurnitureModel(item.length, item.width, item.height);
    });

    furnitureModels.forEach((model) => {
      scene.add(model);
    });

    const light = new THREE.PointLight(0xffffff, 1, 100);
    light.position.set(5, 5, 5);
    scene.add(light);

    const animate = () => {
      requestAnimationFrame(animate);
      controlsRef.current.update();
      TWEEN.update();
      renderer.render(sceneRef.current, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    const handleMouseDown = (event) => {
      event.preventDefault();
      if (controlsRef.current.enabled) {
        controlsRef.current.enabled = false;
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObjects(
          sceneRef.current.children
        );

        if (intersects.length > 0) {
          const object = intersects[0].object;
          const targetRotation = object.rotation.y === 0 ? -Math.PI / 2 : 0;
          new TWEEN.Tween(object.rotation)
            .to({ y: targetRotation }, 1000)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start();
        }
      }
    };

    const handleMouseUp = () => {
      controlsRef.current.enabled = true;
    };

    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      mountRef.current.removeChild(renderer.domElement);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [data]);

  return (
    <div ref={mountRef} style={{ width: "100%", height: "100vh" }}>
      <FurnitureList items={data.items} />
    </div>
  );
}

export default ModelViewer;
