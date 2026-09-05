import { useMemo } from 'react';
import * as THREE from 'three';
import { MarchingCubes } from 'three/examples/jsm/objects/MarchingCubes.js';
import type { Atom } from '../types/atom';
import { getPartialCharge, coulombPotentialAt, potentialToColor } from '../lib/electrostatics';

const RESOLUTION = 48;
const PADDING_ANGSTROM = 4;
const BALL_STRENGTH = 1.2;
const BALL_SUBTRACT = 8;

interface SurfaceMeshProps {
  atoms: Atom[];
  angstromScale: number;
}

export default function SurfaceMesh({ atoms, angstromScale }: SurfaceMeshProps) {
  const { mesh, halfExtent } = useMemo(() => {
    const material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.4 });
    const mc = new MarchingCubes(RESOLUTION, material, false, true, 100000);
    mc.isolation = 40;

    if (atoms.length === 0) {
      return { mesh: mc, halfExtent: 1 };
    }

    // Bounding box in raw (unscaled) Angstrom coordinates, centered at the molecule centroid.
    let maxAbs = 0;
    const centroid = { x: 0, y: 0, z: 0 };
    for (const atom of atoms) {
      centroid.x += atom.x;
      centroid.y += atom.y;
      centroid.z += atom.z;
    }
    centroid.x /= atoms.length;
    centroid.y /= atoms.length;
    centroid.z /= atoms.length;

    for (const atom of atoms) {
      maxAbs = Math.max(
        maxAbs,
        Math.abs(atom.x - centroid.x),
        Math.abs(atom.y - centroid.y),
        Math.abs(atom.z - centroid.z),
      );
    }
    const halfExtentAngstrom = maxAbs + PADDING_ANGSTROM;

    const charges = atoms.map((atom) => ({
      x: atom.x,
      y: atom.y,
      z: atom.z,
      q: getPartialCharge(atom),
    }));
    const maxAbsCharge = charges.reduce((m, c) => Math.max(m, Math.abs(c.q)), 0.001);

    mc.reset();
    for (const atom of atoms) {
      const nx = (atom.x - centroid.x) / (2 * halfExtentAngstrom) + 0.5;
      const ny = (atom.y - centroid.y) / (2 * halfExtentAngstrom) + 0.5;
      const nz = (atom.z - centroid.z) / (2 * halfExtentAngstrom) + 0.5;

      const potential = coulombPotentialAt(atom, charges);
      const [r, g, b] = potentialToColor(potential, maxAbsCharge * 2);

      mc.addBall(nx, ny, nz, BALL_STRENGTH, BALL_SUBTRACT, new THREE.Color(r, g, b));
    }
    mc.update();

    return { mesh: mc, halfExtent: halfExtentAngstrom * angstromScale };
  }, [atoms, angstromScale]);

  return <primitive object={mesh} scale={halfExtent} />;
}
