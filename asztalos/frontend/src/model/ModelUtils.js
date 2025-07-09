import * as THREE from "three";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  getAllCreatedItems,
  getAllObjects
} from "../data/getters";
import { DragControls } from "three/examples/jsm/controls/DragControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass.js";

export const LoadObjects = () => {
  const dispatch = useDispatch();
  const [createdItems, setCreatedItems] = useState([]);
  const [objects, setObjects] = useState([]);
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
  return (objects, createdItems);
};

export const initializeScene = (container) => {
    // Előző WebGL context törlése, ha van
    if (container.renderer) {
      container.renderer.dispose(); // WebGL kontextus törlése
    }
  
    // Új Scene létrehozása
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfffff0);
  
    // Kamera beállítása
    const camera = new THREE.PerspectiveCamera(
      100,
      container.offsetWidth / container.offsetHeight,
      1,
      10000
    );
    camera.position.z = 5;
  
    // WebGLRenderer létrehozása
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    container.appendChild(renderer.domElement);

    // A renderer referencia tárolása a konténerben (hogy később tisztíthassuk)
    container.renderer = renderer;
  
    // Handle window resizing
    window.addEventListener("resize", () => {
      camera.aspect = container.offsetWidth / container.offsetHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.offsetWidth, container.offsetHeight);
    });
  
    return { scene, camera, renderer };
};

export const createRoom = () => {
  const roomMeshes = [];

  // Méretek
  const roomWidth = 5;   // Szoba szélessége
  const roomDepth = 5;   // Szoba hossza
  const roomHeight = 2;  // Szoba magassága

  // Padló létrehozása (halvány szürke szín)
  const floorGeometry = new THREE.PlaneGeometry(roomWidth, roomDepth);
  const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xD3D3D3, side: THREE.DoubleSide });  // Halvány szürke
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;  // Elforgatjuk, hogy a padló vízszintes legyen
  roomMeshes.push(floor);

  // Falak létrehozása (körvonalak)
  const wallMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });  // Fekete körvonalak

  // 1. Hosszú falak
  const wall1Geometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(roomWidth, 0, 0)
  ]);
  const wall1 = new THREE.Line(wall1Geometry, wallMaterial);
  wall1.position.set(0, roomHeight / 2, roomDepth / 2); // Elhelyezés
  roomMeshes.push(wall1);

  const wall2Geometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, roomDepth),
    new THREE.Vector3(roomWidth, 0, roomDepth)
  ]);
  const wall2 = new THREE.Line(wall2Geometry, wallMaterial);
  wall2.position.set(0, roomHeight / 2, 0); // Elhelyezés
  roomMeshes.push(wall2);

  // 2. Rövid falak
  const wall3Geometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, roomDepth)
  ]);
  const wall3 = new THREE.Line(wall3Geometry, wallMaterial);
  wall3.position.set(roomWidth, roomHeight / 2, 0); // Elhelyezés
  roomMeshes.push(wall3);

  const wall4Geometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(roomWidth, 0, 0),
    new THREE.Vector3(roomWidth, 0, roomDepth)
  ]);
  const wall4 = new THREE.Line(wall4Geometry, wallMaterial);
  wall4.position.set(0, roomHeight / 2, roomDepth); // Elhelyezés
  roomMeshes.push(wall4);

  // Visszaadjuk a szoba összes elemét (padló + falak)
  return roomMeshes;
};



/*
export const createBoxes = (items) => {
  const boxes = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    let itemBox = CreateBoxForItem(item);
    for (let j = 0; j < itemBox.length; j++) {
      boxes.push(itemBox[j]);
    }
  };
  return boxes;
};  */

export const createBoxes = (items) => items.flatMap(CreateBoxForItem);

export const CreateBoxForItem = (item) => {
  const size = RetrackValuesFromString(item.size);
  const position = RetrackValuesFromString(item.position);
  const rotation = RetrackValuesFromString(item.rotation);
  const itemBox = [];

  for (let i = 0; i < (item.qty || 1); i++) {
    const s = size[i] || size[0] || [1, 1, 1]; // Ha nincs elég méretadat, alapértelmezett értékeket adunk
    const p = position[i] || position[0] || [0, 0, 0]; // Ha nincs elég pozíció, alapértelmezett középpont
    const r = rotation[i] || rotation[0] || [0, 0, 0]; // Ha nincs elég forgatás, alapértelmezett nulla

    const geometry = new THREE.BoxGeometry(s[0], s[1], s[2]);
    const material = new THREE.MeshStandardMaterial({ color: 0x888888 });
    const box = new THREE.Mesh(geometry, material);

    box.position.set(p[0], p[1], p[2]);
    box.rotation.set(r[0], r[1], r[2]);

    itemBox.push(box);
  }

  return itemBox;
};

export const addObjectsPosition = (itemsMesh, object) => {
  let newItemPosition = [...itemsMesh];
  let ObjectPosition = RetrackValuesFromString(object.position);
  let ObjectRotation = RetrackValuesFromString(object.rotation);
  for (let i = 0; i < newItemPosition.length; i++) {
    newItemPosition[i].position.x += ObjectPosition[0][0];
    newItemPosition[i].position.y += ObjectPosition[0][1];
    newItemPosition[i].position.z += ObjectPosition[0][2];
    newItemPosition[i].rotation.x += ObjectRotation[0][0];
    newItemPosition[i].rotation.y += ObjectRotation[0][1];
    newItemPosition[i].rotation.z += ObjectRotation[0][2];
  }
  return newItemPosition;
};
 
export const makeDraggable = (mesh, scene, camera, renderer) => {
  
  const dragControls = new DragControls([mesh], camera, renderer.domElement);

  dragControls.addEventListener("dragstart", (event) => {
    event.object.material.emissive.set(0xff0000); // Kiemelés húzás közben
  });

  dragControls.addEventListener("dragend", (event) => {
    event.object.material.emissive.set(0x000000); // Visszaállítás
  });

  return dragControls; // Ha kell, eltárolhatod későbbi használatra
};  

export const addLighting = (scene) => {
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 7.5);
scene.add(light);

const ambientLight = new THREE.AmbientLight(0x404040); // Soft white light
scene.add(ambientLight);
};

export const renderScene = (renderer, scene, camera) => {
  const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
  };
  animate();
};

export const RetrackValuesFromString = (string) => {
  const vectorRegex = /\[([\d.-]+),([\d.-]+),([\d.-]+)\]/g;
  const matches = [...string.matchAll(vectorRegex)];

  const matrix = matches.map((match) => {
    return [parseFloat(match[1]), parseFloat(match[2]), parseFloat(match[3])];
  });

  return matrix;
};

export function toggleOutline(scene, camera, renderer, mesh, enable) {
  // Ha nincs engedélyezve, távolítsuk el a kiemelést
  if (!enable) {
    if (mesh.outlineComposer) {
      mesh.outlineComposer.dispose();
      delete mesh.outlineComposer;
    }
    return;
  }

  // Post-processing effekt komponens létrehozása
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  // Outline pass létrehozása
  const outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
  outlinePass.edgeStrength = 10; // Körvonal erőssége
  outlinePass.edgeGlow = 1.5; // Fényhatás mértéke
  outlinePass.edgeThickness = 2; // Körvonal vastagsága
  outlinePass.visibleEdgeColor.set(0xff0000); // Piros körvonal

  composer.addPass(outlinePass);

  // A kijelölt objektum beállítása
  outlinePass.selectedObjects = [mesh];

  // Tároljuk az outline komponenst a mesh objektumban
  mesh.outlineComposer = composer;

  // Animációs ciklus a frissítéshez
  function animate() {
    if (!mesh.outlineComposer) return;
    requestAnimationFrame(animate);
    mesh.outlineComposer.render();
  }
  animate();

  return composer;
}