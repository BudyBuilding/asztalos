//modelutilsworkingprobably
import * as THREE from "three";

/**
 * Initialize a Three.js scene with a basic camera and renderer.
 * @param {HTMLElement} container - The DOM container for rendering the scene.
 * @returns {Object} An object containing the scene, camera, and renderer.
 */
export function initializeScene(container) {
    // Előző WebGL context törlése, ha van
    if (container.renderer) {
      container.renderer.dispose(); // WebGL kontextus törlése
    }
  
    // Új Scene létrehozása
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfffff0);
  
    // Kamera beállítása
    const camera = new THREE.PerspectiveCamera(
      75,
      container.offsetWidth / container.offsetHeight,
      0.1,
      1000
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
  }
  

/**
 * Create one or multiple Three.js box objects from an item.
 * @param {Object} item - The item object containing size, position, and rotation.
 * @returns {Array<THREE.Mesh>} An array of generated meshes.
 */
export function createBoxes(item) {
const parsedAttributes = parseItemAttributes(item);
const boxes = [];

parsedAttributes.forEach(({ size, position, rotation }) => {
    const geometry = new THREE.BoxGeometry(size[0], size[1], size[2]);
    const material = new THREE.MeshStandardMaterial({ color: 0x888888 });

    const box = new THREE.Mesh(geometry, material);
    box.position.set(position[0], position[1], position[2]);
    box.rotation.set(rotation[0], rotation[1], rotation[2]);

    boxes.push(box);
});

return boxes;
}

/**
 * Parse item attributes (size, position, rotation) for multiple elements in one item.
 * Convert sizes and positions from mm to meters, and rotations from degrees to radians.
 * @param {Object} item - The item object.
 * @returns {Array} An array of parsed attributes for each element in the item.
 */
function parseItemAttributes(item) {
const sizes = parseArrayOfVectors(item.size);
const positions = parseArrayOfVectors(item.position);
const rotations = parseArrayOfVectors(item.rotation, true);

const elementCount = Math.max(sizes.length, positions.length, rotations.length);

// Ensure all arrays have the same length, filling missing values with defaults
const parsedAttributes = [];
for (let i = 0; i < elementCount; i++) {
    parsedAttributes.push({
    size: sizes[i] || [1, 1, 1], // Default size
    position: positions[i] || [0, 0, 0], // Default position
    rotation: rotations[i] || [0, 0, 0] // Default rotation
    });
}

return parsedAttributes;
}

/**
 * Parse a string of vectors into an array of [x, y, z] values.
 * Optionally convert rotation angles from degrees to radians.
 * @param {string} vectorString - The string to parse (e.g., "[x,y,z], [x,y,z]").
 * @param {boolean} isRotation - Whether the values are rotation angles.
 * @returns {Array} An array of [x, y, z] vectors.
 */
function parseArrayOfVectors(vectorString, isRotation = false) {
if (!vectorString) return [];

try {
    // Match each [x, y, z] vector in the string
    const vectorRegex = /\[([\d.-]+),([\d.-]+),([\d.-]+)\]/g;
    const matches = [...vectorString.matchAll(vectorRegex)];

    return matches.map((match) => {
    const vector = match.slice(1, 4).map(Number); // Extract x, y, z as numbers
    return isRotation
        ? vector.map((angle) => (angle * Math.PI) / 180) // Convert to radians if needed
        : vector.map((value) => value / 1000); // Convert mm to meters otherwise
    });
} catch (error) {
    console.error("Failed to parse vectors:", vectorString, error);
    return [];
}
}

/**
 * Add lighting to the scene.
 * @param {THREE.Scene} scene - The Three.js scene.
 */
export function addLighting(scene) {
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 7.5);
scene.add(light);

const ambientLight = new THREE.AmbientLight(0x404040); // Soft white light
scene.add(ambientLight);
}

/**
 * Render the scene using the provided renderer and camera.
 * @param {THREE.Renderer} renderer - The renderer.
 * @param {THREE.Scene} scene - The scene.
 * @param {THREE.Camera} camera - The camera.
 */
export function renderScene(renderer, scene, camera) {
const animate = () => {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
};
animate();
}
