// core
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
// Sounds
import { playHitSound } from '../audio';

export const defaultMaterial = new CANNON.Material('default');
export const defaultContactMaterial = new CANNON.ContactMaterial(defaultMaterial, defaultMaterial, {
  friction: 0.1,
  restitution: 0.7,
});

// Create box
const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const boxMaterial = new THREE.MeshStandardMaterial({
  metalness: 0.3,
  roughness: 0.4,
});

export function createBox({ width, height, depth, position, scene, world, objectsToUpdate }) {
  // Three.js mesh
  const mesh = new THREE.Mesh(boxGeometry, boxMaterial);
  mesh.scale.set(width, height, depth);
  mesh.castShadow = true;
  mesh.position.copy(position);
  scene.add(mesh);

  // Cannon.js body
  const shape = new CANNON.Box(new CANNON.Vec3(width * 0.5, height * 0.5, depth * 0.5));
  const body = new CANNON.Body({
    mass: 1,
    position: new CANNON.Vec3(0, 3, 0),
    shape,
    material: defaultMaterial,
  });
  body.position.copy(position);
  body.addEventListener('collide', playHitSound);
  world.addBody(body);

  // Save in objects
  objectsToUpdate.push({ mesh, body });
}

// Create sphere
const sphereGeometry = new THREE.SphereGeometry(1, 20, 20);
const sphereMaterial = new THREE.MeshStandardMaterial({
  metalness: 0.3,
  roughness: 0.4,
});

export function createSphere({ radius, position, scene, world, objectsToUpdate }) {
  // Three.js mesh
  const mesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
  mesh.castShadow = true;
  mesh.scale.set(radius, radius, radius);
  mesh.position.copy(position);
  scene.add(mesh);
  // Cannon.js body
  const shape = new CANNON.Sphere(radius);
  const body = new CANNON.Body({
    mass: 1,
    position: new CANNON.Vec3(0, 3, 0),
    shape,
    material: defaultMaterial,
  });
  body.position.copy(position);
  body.addEventListener('collide', playHitSound);
  world.addBody(body);

  // Save in objects
  objectsToUpdate.push({ mesh, body });
}
