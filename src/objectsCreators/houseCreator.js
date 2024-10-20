// core
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
// constants
import { WALLS_HEIGHT, WALLS_WIDTH, ROOF_HEIGHT, ROOF_WIDTH, DOOR_HEIGHT } from '../constants';
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

export function createHouse({ position, scene, world, objectsToUpdate }) {
  //const house = new THREE.Group();

  // const walls = new THREE.Mesh(
  //   new THREE.BoxGeometry(WALLS_WIDTH, WALLS_HEIGHT, WALLS_WIDTH),
  //   new THREE.MeshStandardMaterial({
  //     map: bricksColorTexture,
  //     aoMap: bricksAmbientOcclusionTexture,
  //     normalMap: bricksNormalTexture,
  //     roughnessMap: bricksRoughnessTexture,
  //   })
  // );
  // walls.geometry.setAttribute(
  //   'uv2',
  //   new THREE.Float32BufferAttribute(walls.geometry.attributes.uv.array, 2)
  // );
  // walls.castShadow = true;
  // walls.receiveShadow = true;
  // walls.position.copy(position);

  const wall = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, WALLS_HEIGHT, WALLS_WIDTH),
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
  wall.position.copy({ ...position, x: position.x + WALLS_WIDTH / 2 });
  scene.add(wall);

  // const roof = new THREE.Mesh(
  //   new THREE.ConeGeometry(ROOF_WIDTH, ROOF_HEIGHT, ROOF_WIDTH),
  //   new THREE.MeshStandardMaterial({ color: '#b35f45' })
  // );
  // const roofPosition = { ...position, y: WALLS_HEIGHT + ROOF_HEIGHT / 2 };
  // roof.position.copy(roofPosition);
  // roof.rotation.y = Math.PI / 4;
  // roof.castShadow = true;
  // roof.receiveShadow = true;

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
  door.position.z = WALLS_WIDTH / 2 + 0.01;
  door.position.y = DOOR_HEIGHT / 2 - 0.1;

  //house.add(walls, /*roof,*/ door);
  scene.add(/*walls, roof,*/ door);

  // Cannon.js body
  // const wallsShape = new CANNON.Box(
  //   new CANNON.Vec3(WALLS_WIDTH * 0.5, WALLS_HEIGHT * 0.5, WALLS_WIDTH * 0.5)
  // );
  // const wallsBody = new CANNON.Body({
  //   mass: 1,
  //   position: new CANNON.Vec3(0, 0, 0),
  //   shape: wallsShape,
  //   material: defaultMaterial,
  // });
  // wallsBody.position.copy(position);
  // wallsBody.addEventListener('collide', playHitSound);
  // world.addBody(wallsBody);

  const wallShape = new CANNON.Box(
    new CANNON.Vec3(0.12 * 0.5, WALLS_HEIGHT * 0.5, WALLS_WIDTH * 0.5)
  );
  const wallBody = new CANNON.Body({
    mass: 1,
    position: new CANNON.Vec3(0, 0, 0),
    shape: wallShape,
    material: defaultMaterial,
  });
  wallBody.position.copy({ ...position, x: position.x + WALLS_WIDTH / 2 });
  wallBody.addEventListener('collide', playHitSound);
  world.addBody(wallBody);

  // const roofShape = new CANNON.Box(
  //   new CANNON.Vec3(ROOF_WIDTH * 0.5, ROOF_HEIGHT * 0.5, ROOF_WIDTH * 0.5)
  // );
  // const roofBody = new CANNON.Body({
  //   mass: 1,
  //   position: new CANNON.Vec3(0, 0, 0),
  //   shape: roofShape,
  //   material: defaultMaterial,
  // });
  // roofBody.position.copy(roofPosition);
  // roofBody.quaternion.copy(roof.quaternion);
  // roofBody.addEventListener('collide', playHitSound);
  // world.addBody(roofBody);

  // Save in objects
  //objectsToUpdate.push({ mesh: roof, body: roofBody });
  //objectsToUpdate.push({ mesh: walls, body: wallsBody });
  objectsToUpdate.push({ mesh: wall, body: wallBody });
}
