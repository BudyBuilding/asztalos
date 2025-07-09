import  { useEffect } from "react";
import * as THREE from "three";
import { DragControls } from "three/examples/jsm/controls/DragControls";
import { parseStringToArray, convertToRadians } from "./ModelUtils.js";

export const ObjectViewer = ({
  fullModel,
  objectId,
  createdItems,
  objects,
  scene,
  camera,
  renderer,
}) => {
  useEffect(() => {
    /*
    console.log("ObjectViewer props:");
    console.log("Full Model:", fullModel);
    console.log("Object ID:", objectId);
    console.log("Created Items:", createdItems);
    console.log("Objects:", objects);
    console.log("Scene:", scene);
    console.log("Camera:", camera);
    console.log("Renderer:", renderer);
*/
    if (fullModel) {
      // Teljes modell megjelenítése
      const allBoxes = [];
      objects.forEach((object) => {
        const objectSize = parseStringToArray(object.size).map(
          (value) => value / 1000
        ); // Méret konvertálása
        const objectPosition = parseStringToArray(object.position).map(
          (value) => value / 1000
        ); // Pozíció konvertálása
        const objectRotation = convertToRadians(
          parseStringToArray(object.rotation)
        );

        const geometry = new THREE.BoxGeometry(
          objectSize[0],
          objectSize[1],
          objectSize[2]
        );
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const box = new THREE.Mesh(geometry, material);
        box.position.set(
          objectPosition[0],
          objectPosition[1],
          objectPosition[2]
        );
        box.rotation.set(
          objectRotation[0],
          objectRotation[1],
          objectRotation[2]
        );
        scene.add(box);
        allBoxes.push(box);
      });
    } else {
      // Egy objektum megjelenítése középen
      const selectedObject = objects.find((obj) => obj.objectId === objectId);
      if (selectedObject) {
        const objectSize = parseStringToArray(selectedObject.size).map(
          (value) => value / 1000
        ); // Méret konvertálása
        const objectPosition = [0, 0, 0]; // Középen
        const objectRotation = convertToRadians(
          parseStringToArray(selectedObject.rotation)
        );

        const geometry = new THREE.BoxGeometry(
          objectSize[0],
          objectSize[1],
          objectSize[2]
        );
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const box = new THREE.Mesh(geometry, material);
        box.position.set(
          objectPosition[0],
          objectPosition[1],
          objectPosition[2]
        );
        box.rotation.set(
          objectRotation[0],
          objectRotation[1],
          objectRotation[2]
        );

        const currentItems = itemFilter(objectId, createdItems);
        const items = createObjects(objectId, currentItems);
        items.forEach((item) => box.add(item));

        const dragControls = new DragControls(
          items,
          camera,
          renderer.domElement
        );
        dragControls.addEventListener("dragstart", (event) => {
          event.object.material.emissive.set(0xaaaaaa);
        });
        dragControls.addEventListener("dragend", (event) => {
          event.object.material.emissive.set(0x000000);
        });

        scene.add(box);
      }
    }
  }, [fullModel, objectId, objects, createdItems, scene, camera, renderer]);

  return null;
};

const createObjects = (objectId, currentItems) => {
  return currentItems.map((currentItem) => {
    const size = parseStringToArray(currentItem.size).map(
      (value) => value / 1000
    ); // Méret konvertálása
    const position = parseStringToArray(currentItem.position).map(
      (value) => value / 1000
    ); // Pozíció konvertálása
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

const itemFilter = (objectId, createdItems) => {
  return createdItems.filter((item) => item.object.objectId === objectId);
};

export default ObjectViewer;
