import { useMemo, useRef, useLayoutEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { Atom } from '../types/atom';
import { getElementColor } from '../lib/cpkColors';

const ANGSTROM_SCALE = 0.3;
const SPHERE_RADIUS = 0.4;

interface AtomGroupProps {
  atoms: Atom[];
  color: string;
  center: THREE.Vector3;
}

function AtomGroup({ atoms, color, center }: AtomGroupProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const matrix = new THREE.Matrix4();
    atoms.forEach((atom, i) => {
      matrix.setPosition(
        atom.x * ANGSTROM_SCALE - center.x,
        atom.y * ANGSTROM_SCALE - center.y,
        atom.z * ANGSTROM_SCALE - center.z,
      );
      mesh.setMatrixAt(i, matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [atoms, center]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, atoms.length]}>
      <sphereGeometry args={[SPHERE_RADIUS, 12, 12]} />
      <meshStandardMaterial color={color} />
    </instancedMesh>
  );
}

interface MoleculeViewerProps {
  atoms: Atom[];
}

export default function MoleculeViewer({ atoms }: MoleculeViewerProps) {
  const { groups, center } = useMemo(() => {
    const byElement = new Map<string, Atom[]>();
    const sum = new THREE.Vector3();

    for (const atom of atoms) {
      const list = byElement.get(atom.element) ?? [];
      list.push(atom);
      byElement.set(atom.element, list);
      sum.x += atom.x * ANGSTROM_SCALE;
      sum.y += atom.y * ANGSTROM_SCALE;
      sum.z += atom.z * ANGSTROM_SCALE;
    }

    const centerPoint = atoms.length > 0 ? sum.divideScalar(atoms.length) : new THREE.Vector3();

    return { groups: Array.from(byElement.entries()), center: centerPoint };
  }, [atoms]);

  return (
    <Canvas camera={{ position: [0, 0, 50], fov: 50 }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 10]} intensity={1} />
      <directionalLight position={[-10, -10, -10]} intensity={0.3} />
      {groups.map(([element, groupAtoms]) => (
        <AtomGroup key={element} atoms={groupAtoms} color={getElementColor(element)} center={center} />
      ))}
      <OrbitControls makeDefault />
    </Canvas>
  );
}
