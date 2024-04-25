import React, { useRef, useEffect } from "react";
import * as THREE from "three";

function FurnitureModel({ length, width, height }) {
  const meshRef = useRef(null);

  useEffect(() => {
    const geometry = new THREE.BoxGeometry(length, height, width);
    const material = new THREE.MeshBasicMaterial({ color: 0x8b4513 });
    const cube = new THREE.Mesh(geometry, material);
    meshRef.current = cube;
  }, [length, width, height]);

  return <mesh ref={meshRef} />;
}

export default FurnitureModel;
