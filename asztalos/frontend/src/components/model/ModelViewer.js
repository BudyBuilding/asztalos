import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

function ModelViewer() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const selectedObject = useSelector((state) => state.selectedObject);
  const createdItems = useSelector((state) => state.createdItems);

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffe9);

    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current
        ? containerRef.current.clientWidth / containerRef.current.clientHeight
        : 1,
      0.5,
      100000
    );

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

    camera.position.set(0, 2500, 5000);

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

    // Cleanup function
    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.dispose(); // Clean up renderer resources
    };
  }, [selectedObject, createdItems]); // Dependencies for useEffect

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", overflow: "hidden" }}
    >
      <div ref={canvasRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}

export default ModelViewer;
