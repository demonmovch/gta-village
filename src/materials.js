import * as CANNON from 'cannon-es';

export const defaultMaterial = new CANNON.Material('default');
export const defaultContactMaterial = new CANNON.ContactMaterial(defaultMaterial, defaultMaterial, {
  friction: 0.1,
  restitution: 0.7,
});

export const wheelMaterial = new CANNON.Material('wheel');
export const wheelContactMaterial = new CANNON.ContactMaterial(wheelMaterial, defaultMaterial, {
  friction: 1,
  restitution: 0.5,
  contactEquationStiffness: 1000,
});
