// core
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import CannonDebugRenderer from 'cannon-es-debugger';
// styles
import './style.css';
// constants
import { WALLS_HEIGHT } from './constants';
// objectsCreators
import { createHouse, createFloor, createBox, createSphere } from './objectsCreators';

import {
  defaultMaterial,
  defaultContactMaterial,
  /*wheelMaterial,*/
  wheelContactMaterial,
} from './materials';

const canvas = document.querySelector('#webgl');
const objectsToUpdate = [];
const sizes = { width: window.innerWidth, height: window.innerHeight };

const wheelOptions = {
  radius: 0.25,
  directionLocal: new CANNON.Vec3(0, -1, 0),
  suspensionStiffness: 30,
  suspensionRestLength: 0.3,
  frictionSlip: 1.4,
  dampingRelaxation: 2.3,
  dampingCompression: 4.4,
  maxSuspensionForce: 100000,
  rollInfluence: 0.01,
  axleLocal: new CANNON.Vec3(0, 0, 1),
  chassisConnectionPointLocal: new CANNON.Vec3(-1, 0, 1),
  maxSuspensionTravel: 0.3,
  customSlidingRotationalSpeed: -30,
  useCustomSlidingRotationalSpeed: true,
};

// Scene
const scene = new THREE.Scene();

/* Physics */
const world = new CANNON.World();
world.broadphase = new CANNON.SAPBroadphase(world);
world.allowSleep = true;
world.gravity.set(0, -9.82, 0);
world.defaultContactMaterial = defaultContactMaterial;
world.addContactMaterial(wheelContactMaterial);

/* car */
// Build the car chassis
const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const boxMaterial = new THREE.MeshStandardMaterial({
  metalness: 0.3,
  roughness: 0.4,
});
const chassisMesh = new THREE.Mesh(boxGeometry, boxMaterial);
chassisMesh.scale.set(1 * 2, 0.25 * 2, 0.5 * 2);
chassisMesh.position.set(7, 0, 5);
chassisMesh.castShadow = true;
chassisMesh.receiveShadow = true;
scene.add(chassisMesh);

const chassisShape = new CANNON.Box(new CANNON.Vec3(1, 0.25, 0.5));
const chassisBody = new CANNON.Body({
  mass: 150,
  shape: chassisShape,
  material: defaultMaterial,
});
chassisBody.position.copy(chassisMesh.position);
chassisBody.angularVelocity.set(0, 0.5, 0);
// Save in objects
objectsToUpdate.push({ mesh: chassisMesh, body: chassisBody });
// Create the vehicle
const vehicle = new CANNON.RaycastVehicle({ chassisBody });

wheelOptions.chassisConnectionPointLocal.set(-0.5, 0, 0.5);
vehicle.addWheel(wheelOptions);
wheelOptions.chassisConnectionPointLocal.set(-0.5, 0, -0.5);
vehicle.addWheel(wheelOptions);
wheelOptions.chassisConnectionPointLocal.set(0.5, 0, 0.5);
vehicle.addWheel(wheelOptions);
wheelOptions.chassisConnectionPointLocal.set(0.5, 0, -0.5);
vehicle.addWheel(wheelOptions);
vehicle.addToWorld(world);

// Add the wheel bodies
const wheelBodies = [];
const wheelMaterial = new CANNON.Material('wheel');
vehicle.wheelInfos.forEach((wheel) => {
  const cylinderShape = new CANNON.Cylinder(wheel.radius, wheel.radius, wheel.radius / 2, 20);
  const wheelBody = new CANNON.Body({
    mass: 0,
    material: wheelMaterial,
  });
  wheelBody.type = CANNON.Body.KINEMATIC;
  wheelBody.collisionFilterGroup = 0; // turn off collisions
  const quaternion = new CANNON.Quaternion().setFromEuler(-Math.PI / 2, 0, 0);
  wheelBody.addShape(cylinderShape, new CANNON.Vec3(), quaternion);
  wheelBodies.push(wheelBody);
  world.addBody(wheelBody);
});

// Update the wheel bodies
world.addEventListener('postStep', () => {
  for (let i = 0; i < vehicle.wheelInfos.length; i++) {
    vehicle.updateWheelTransform(i);
    const transform = vehicle.wheelInfos[i].worldTransform;
    const wheelBody = wheelBodies[i];
    wheelBody.position.copy(transform.position);
    wheelBody.quaternion.copy(transform.quaternion);
  }
});

/*--------------------------------*/

createFloor({ scene, world });
createHouse({
  position: { x: 0, y: WALLS_HEIGHT / 2, z: 0 },
  scene,
  world,
  objectsToUpdate,
});
createSphere({ radius: 1, position: { x: 3, y: 10, z: 5 }, scene, world, objectsToUpdate });
createBox({
  width: 0.12,
  height: WALLS_HEIGHT,
  depth: 2,
  position: { x: 8, y: WALLS_HEIGHT / 2, z: 1 },
  scene,
  world,
  objectsToUpdate,
});
createBox({
  width: 1,
  height: 1.5,
  depth: 2,
  position: { x: 6, y: 5, z: 1 },
  scene,
  world,
  objectsToUpdate,
});

/* Lights */
// Ambient light
const ambientLight = new THREE.AmbientLight('#fff', 0.4);
scene.add(ambientLight);
// Directional light
const directionalLight = new THREE.DirectionalLight('#fff', 0.4);
directionalLight.position.set(7, 10, -2);
scene.add(directionalLight);

/* Camera */
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.x = 8;
camera.position.y = 5;
camera.position.z = 10;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/* Renderer */
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/* Shadows */
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
directionalLight.castShadow = true;
directionalLight.shadow.camera.far = 20;
directionalLight.shadow.camera.top = 20;
directionalLight.shadow.camera.right = 20;
directionalLight.shadow.camera.bottom = -20;
directionalLight.shadow.camera.left = -20;

// Helpers
const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 1);
//const directionalLightCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
//const axesHelper = new THREE.AxesHelper(20);
//scene.add(axesHelper, directionalLightHelper /*, directionalLightCameraHelper*/);
//const cannonDebugRenderer = new CannonDebugRenderer(scene, world);

/* Animate */
const clock = new THREE.Clock();
let oldElapsedTime = 0;

function animate() {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - oldElapsedTime;
  oldElapsedTime = elapsedTime;

  objectsToUpdate.forEach((object) => {
    object.mesh.position.copy(object.body.position);
    object.mesh.quaternion.copy(object.body.quaternion);
  });

  world.step(1 / 60, deltaTime, 3); // Update physics
  //cannonDebugRenderer.update(); // Update cannon.js debug renderer
  controls.update(); // Update controls
  renderer.render(scene, camera); // Render the scene
  window.requestAnimationFrame(animate); // Call animate function again on the next frame
}

animate();

// Add force on keydown
document.addEventListener('keydown', (event) => {
  const maxSteerVal = 0.5;
  const maxForce = 1000;
  const brakeForce = 1000000;

  switch (event.key) {
    case 'w':
    case 'ArrowUp':
      vehicle.applyEngineForce(-maxForce, 2);
      vehicle.applyEngineForce(-maxForce, 3);
      break;

    case 's':
    case 'ArrowDown':
      vehicle.applyEngineForce(maxForce, 2);
      vehicle.applyEngineForce(maxForce, 3);
      break;

    case 'a':
    case 'ArrowLeft':
      vehicle.setSteeringValue(maxSteerVal, 0);
      vehicle.setSteeringValue(maxSteerVal, 1);
      break;

    case 'd':
    case 'ArrowRight':
      vehicle.setSteeringValue(-maxSteerVal, 0);
      vehicle.setSteeringValue(-maxSteerVal, 1);
      break;

    case 'b':
      vehicle.setBrake(brakeForce, 0);
      vehicle.setBrake(brakeForce, 1);
      vehicle.setBrake(brakeForce, 2);
      vehicle.setBrake(brakeForce, 3);
      break;
  }
});

// Reset force on keyup
document.addEventListener('keyup', (event) => {
  switch (event.key) {
    case 'w':
    case 'ArrowUp':
      vehicle.applyEngineForce(0, 2);
      vehicle.applyEngineForce(0, 3);
      break;

    case 's':
    case 'ArrowDown':
      vehicle.applyEngineForce(0, 2);
      vehicle.applyEngineForce(0, 3);
      break;

    case 'a':
    case 'ArrowLeft':
      vehicle.setSteeringValue(0, 0);
      vehicle.setSteeringValue(0, 1);
      break;

    case 'd':
    case 'ArrowRight':
      vehicle.setSteeringValue(0, 0);
      vehicle.setSteeringValue(0, 1);
      break;

    case 'b':
      vehicle.setBrake(0, 0);
      vehicle.setBrake(0, 1);
      vehicle.setBrake(0, 2);
      vehicle.setBrake(0, 3);
      break;
  }
});

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
