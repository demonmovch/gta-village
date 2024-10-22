// core
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
// constants
import {
  WALLS_HEIGHT,
  WALLS_WIDTH,
  WALLS_DEPTH,
  ROOF_HEIGHT,
  ROOF_WIDTH,
  DOOR_HEIGHT,
} from '../constants';
// Sounds
import { playHitSound } from '../audio';
// cannon.js material
import { defaultMaterial } from './defaultMaterial';

/* Textures */
const textureLoader = new THREE.TextureLoader();
const doorColorTexture = textureLoader.load('/textures/door/color.jpg');
const doorAlphaTexture = textureLoader.load('/textures/door/alpha.jpg');
const doorAmbientOcclusionTexture = textureLoader.load('/textures/door/ambientOcclusion.jpg');
const doorHeightTexture = textureLoader.load('/textures/door/height.jpg');
const doorNormalTexture = textureLoader.load('/textures/door/normal.jpg');
const doorMetalnessTexture = textureLoader.load('/textures/door/metalness.jpg');
const doorRoughnessTexture = textureLoader.load('/textures/door/roughness.jpg');
const bricksColorTexture = textureLoader.load('/textures/bricks/color.jpg');
const bricksAmbientOcclusionTexture = textureLoader.load('/textures/bricks/ambientOcclusion.jpg');
const bricksNormalTexture = textureLoader.load('/textures/bricks/normal.jpg');
const bricksRoughnessTexture = textureLoader.load('/textures/bricks/roughness.jpg');

function createWall(scene, world, objectsToUpdate) {
  // Three.js mesh
  const wall = new THREE.Mesh(
    new THREE.BoxGeometry(WALLS_DEPTH, WALLS_HEIGHT, WALLS_WIDTH),
    new THREE.MeshStandardMaterial({
      map: bricksColorTexture,
      aoMap: bricksAmbientOcclusionTexture,
      normalMap: bricksNormalTexture,
      roughnessMap: bricksRoughnessTexture,
    })
  );
  wall.geometry.setAttribute(
    'uv2',
    new THREE.Float32BufferAttribute(wall.geometry.attributes.uv.array, 2)
  );
  wall.castShadow = true;
  wall.receiveShadow = true;
  scene.add(wall);

  // Cannon.js body
  const wallShape = new CANNON.Box(
    new CANNON.Vec3(WALLS_DEPTH * 0.5, WALLS_HEIGHT * 0.5, WALLS_WIDTH * 0.5)
  );
  const wallBody = new CANNON.Body({
    mass: 1,
    position: new CANNON.Vec3(0, 0, 0),
    shape: wallShape,
    material: defaultMaterial,
  });
  wallBody.addEventListener('collide', playHitSound);
  world.addBody(wallBody);

  objectsToUpdate.push({ mesh: wall, body: wallBody });

  return { wallMesh: wall, wallBody };
}

export function createHouse({ position, scene, world, objectsToUpdate }) {
  //const house = new THREE.Group();

  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(ROOF_WIDTH, ROOF_HEIGHT, ROOF_WIDTH),
    new THREE.MeshStandardMaterial({ color: '#b35f45' })
  );
  roof.position.copy({ ...position, y: WALLS_HEIGHT + ROOF_HEIGHT / 2 });
  //roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;
  roof.receiveShadow = true;

  const { wallMesh: wall1Mesh, wallBody: wall1Body } = createWall(scene, world, objectsToUpdate);
  wall1Mesh.position.copy({ ...position, x: position.x + WALLS_WIDTH / 2 });
  wall1Body.position.copy(wall1Mesh.position);

  const { wallMesh: wall2Mesh, wallBody: wall2Body } = createWall(scene, world, objectsToUpdate);
  wall2Mesh.position.copy({
    ...position,
    x: position.x / 2,
    z: position.z + WALLS_DEPTH / 2 + WALLS_WIDTH / 2,
  });
  wall2Body.position.copy(wall2Mesh.position);
  wall2Mesh.rotation.y = Math.PI / 2;
  wall2Body.quaternion.copy(wall2Mesh.quaternion);

  const { wallMesh: wall3Mesh, wallBody: wall3Body } = createWall(scene, world, objectsToUpdate);
  wall3Mesh.position.copy({
    ...position,
    x: position.x - WALLS_WIDTH / 2,
  });
  wall3Body.position.copy(wall3Mesh.position);

  const { wallMesh: wall4Mesh, wallBody: wall4Body } = createWall(scene, world, objectsToUpdate);
  wall4Mesh.position.copy({
    ...position,
    z: position.z - WALLS_DEPTH / 2 - WALLS_WIDTH / 2,
  });
  wall4Mesh.rotation.y = Math.PI / 2;
  wall4Body.position.copy(wall4Mesh.position);
  wall4Body.quaternion.copy(wall4Mesh.quaternion);

  const door = new THREE.Mesh(
    new THREE.PlaneGeometry(DOOR_HEIGHT, DOOR_HEIGHT, 100, 100),
    new THREE.MeshStandardMaterial({
      map: doorColorTexture,
      transparent: true,
      alphaMap: doorAlphaTexture,
      aoMap: doorAmbientOcclusionTexture,
      displacementMap: doorHeightTexture,
      displacementScale: 0.1,
      normalMap: doorNormalTexture,
      metalnessMap: doorMetalnessTexture,
      roughnessMap: doorRoughnessTexture,
    })
  );
  door.geometry.setAttribute(
    'uv2',
    new THREE.Float32BufferAttribute(door.geometry.attributes.uv.array, 2)
  );
  door.position.z = WALLS_WIDTH / 2 + 0.05 + WALLS_DEPTH / 2;
  door.position.y = DOOR_HEIGHT / 2 - 0.1;

  //house.add(walls, /*roof,*/ door);
  scene.add(roof, door);

  // Cannon.js body
  const roofShape = new CANNON.Box(
    new CANNON.Vec3(ROOF_WIDTH * 0.5, ROOF_HEIGHT * 0.5, ROOF_WIDTH * 0.5)
  );
  const roofBody = new CANNON.Body({
    mass: 1,
    position: new CANNON.Vec3(0, 0, 0),
    shape: roofShape,
    material: defaultMaterial,
  });
  roofBody.position.copy(roof.position);
  roofBody.quaternion.copy(roof.quaternion);
  roofBody.addEventListener('collide', playHitSound);
  world.addBody(roofBody);

  // Save in objects
  objectsToUpdate.push({ mesh: roof, body: roofBody });
  //objectsToUpdate.push({ mesh: walls, body: wallsBody });
}
