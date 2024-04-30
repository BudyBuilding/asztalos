import React, { useRef, useEffect } from "react";
import * as THREE from "three";

function FurnitureModel({ length, width, height, sceneRef }) {
  const meshRef = useRef(null);

  useEffect(() => {
    // Create a new mesh if not already created
    if (!meshRef.current) {
      const geometry = new THREE.BoxGeometry(length, height, width);
      const material = new THREE.MeshBasicMaterial({ color: 0x8b4513 });
      const cube = new THREE.Mesh(geometry, material);
      meshRef.current = cube;
    }

    // Add mesh to the scene if sceneRef.current is available
    if (sceneRef.current) {
      sceneRef.current.add(meshRef.current);
    }

    // Update mesh scale if dimensions change
    if (meshRef.current) {
      meshRef.current.scale.set(length, height, width);
    }

    // Cleanup function
    return () => {
      if (sceneRef.current && meshRef.current) {
        sceneRef.current.remove(meshRef.current);
      }
    };
  }, [length, width, height, sceneRef]);

  return null; // Return null because we don't need to render anything
}

export default FurnitureModel;
