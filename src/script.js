// core
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// styles
import './style.css';
// constants
import { WALLS_HEIGHT, WALLS_WIDTH } from './constants';
// objectsCreators
import { createBox, createSphere, defaultContactMaterial } from './objectsCreators/objectsCreators';
import { createHouse } from './objectsCreators/houseCreator';

const canvas = document.querySelector('#webgl');
const objectsToUpdate = [];
const sizes = { width: window.innerWidth, height: window.innerHeight };

// Scene
const scene = new THREE.Scene();

/* Physics */
const world = new CANNON.World();
world.broadphase = new CANNON.SAPBroadphase(world);
world.allowSleep = true;
world.gravity.set(0, -9.82, 0);
world.defaultContactMaterial = defaultContactMaterial;

/* Textures */
const textureLoader = new THREE.TextureLoader();

const grassColorTexture = textureLoader.load('/textures/grass/color.jpg');
const grassAmbientOcclusionTexture = textureLoader.load('/textures/grass/ambientOcclusion.jpg');
const grassNormalTexture = textureLoader.load('/textures/grass/normal.jpg');
const grassRoughnessTexture = textureLoader.load('/textures/grass/roughness.jpg');

grassColorTexture.repeat.set(8, 8);
grassAmbientOcclusionTexture.repeat.set(8, 8);
grassNormalTexture.repeat.set(8, 8);
grassRoughnessTexture.repeat.set(8, 8);
grassColorTexture.wrapS = THREE.RepeatWrapping;
grassAmbientOcclusionTexture.wrapS = THREE.RepeatWrapping;
grassNormalTexture.wrapS = THREE.RepeatWrapping;
grassRoughnessTexture.wrapS = THREE.RepeatWrapping;
grassColorTexture.wrapT = THREE.RepeatWrapping;
grassAmbientOcclusionTexture.wrapT = THREE.RepeatWrapping;
grassNormalTexture.wrapT = THREE.RepeatWrapping;
grassRoughnessTexture.wrapT = THREE.RepeatWrapping;

// Floor cannon.js
const floorShape = new CANNON.Plane();
const floorBody = new CANNON.Body();
floorBody.mass = 0;
floorBody.addShape(floorShape);
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5);
world.addBody(floorBody);

// Floor three.js
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial({
    map: grassColorTexture,
    aoMap: grassAmbientOcclusionTexture,
    normalMap: grassNormalTexture,
    roughnessMap: grassRoughnessTexture,
  })
);
floor.geometry.setAttribute(
  'uv2',
  new THREE.Float32BufferAttribute(floor.geometry.attributes.uv.array, 2)
);
floor.rotation.x = -Math.PI * 0.5;
scene.add(floor);

createSphere({ radius: 1, position: { x: 3, y: 10, z: 0 }, scene, world, objectsToUpdate });
createBox({
  width: 1,
  height: 1.5,
  depth: 2,
  position: { x: 6, y: 5, z: 1 },
  scene,
  world,
  objectsToUpdate,
});
createHouse({
  position: { x: 0, y: WALLS_HEIGHT / 2, z: 0 },
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
floor.receiveShadow = true;

// Helpers
const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 1);
//const directionalLightCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
const axesHelper = new THREE.AxesHelper(20);
scene.add(axesHelper, directionalLightHelper /*, directionalLightCameraHelper*/);

/* Animate */
const clock = new THREE.Clock();
let oldElapsedTime = 0;

function tick() {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - oldElapsedTime;
  oldElapsedTime = elapsedTime;

  objectsToUpdate.forEach((obj) => {
    obj.mesh.position.copy(obj.body.position);
    obj.mesh.quaternion.copy(obj.body.quaternion);
  });

  world.step(1 / 60, deltaTime, 3); // Update physics
  controls.update(); // Update controls
  renderer.render(scene, camera); // Render
  window.requestAnimationFrame(tick); // Call tick again on the next frame
}

tick();

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
