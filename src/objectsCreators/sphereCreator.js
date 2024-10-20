// core
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
// Sounds
import { playHitSound } from '../audio';
// cannon.js material
import { defaultMaterial } from './defaultMaterial';

const sphereGeometry = new THREE.SphereGeometry(1, 20, 20);
const sphereMaterial = new THREE.MeshStandardMaterial({
  metalness: 0.3,
  roughness: 0.4,
});

export function createSphere({ radius, position, scene, world, objectsToUpdate }) {
  // Three.js mesh
  const mesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
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
