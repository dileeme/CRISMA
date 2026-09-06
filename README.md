# CRISMA

CRISMA is a 3D molecular visualization platform for drug design and delivery,
built with React, TypeScript, and Three.js. It lets users load a protein
structure by PDB ID and observe it at the molecular level directly in the
browser.

## Features

- **Structure loading** — fetches a structure from the RCSB PDB by ID and
  parses its `ATOM`/`HETATM` records (`src/lib/pdbFetch.ts`, `src/lib/pdbParse.ts`).
- **3D molecular viewer** — atoms rendered as CPK-colored instanced spheres in
  a Three.js scene (via `@react-three/fiber`), with orbit camera controls
  (`src/components/MoleculeViewer.tsx`).
- **Electrostatic potential surface mapping** — an approximate Coulombic
  potential is computed per atom from a partial-charge lookup table and
  rendered as a marching-cubes surface, colored on a red (negative) to blue
  (positive) gradient. Toggle between the atom view and the surface view from
  the viewer toolbar (`src/lib/electrostatics.ts`, `src/components/SurfaceMesh.tsx`).

More features (docking score overlays, molecular dynamics trajectory
playback) are in active development.

## Tech stack

- [React](https://react.dev/) 19 + TypeScript
- [Vite](https://vite.dev/) for dev/build tooling
- [Three.js](https://threejs.org/) via [`@react-three/fiber`](https://github.com/pmndrs/react-three-fiber) and [`@react-three/drei`](https://github.com/pmndrs/drei)
- [Tailwind CSS](https://tailwindcss.com/) v4 for UI styling

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL, enter a PDB ID (e.g. `1CRN`), and click
Load.

## Scripts

- `npm run dev` — start the Vite dev server
- `npm run build` — type-check and build for production
- `npm run lint` — run Oxlint
- `npm run preview` — preview the production build locally
