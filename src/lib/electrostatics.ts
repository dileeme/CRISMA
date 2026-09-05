import type { Atom } from '../types/atom';

/**
 * Simplified partial-charge table for a Coulombic *approximation* only —
 * not a substitute for a real force-field (e.g. Gasteiger/AMBER) assignment.
 * Keyed by "RESIDUE:ATOM"; falls back to a per-element heuristic when the
 * residue/atom pair isn't listed.
 */
const RESIDUE_ATOM_CHARGES: Record<string, number> = {
  'ASP:OD1': -0.8, 'ASP:OD2': -0.8, 'ASP:CG': 0.6,
  'GLU:OE1': -0.8, 'GLU:OE2': -0.8, 'GLU:CD': 0.6,
  'LYS:NZ': 1.0,
  'ARG:NH1': 0.8, 'ARG:NH2': 0.8, 'ARG:NE': 0.4, 'ARG:CZ': 0.6,
  'HIS:ND1': 0.3, 'HIS:NE2': 0.3,
  'SER:OG': -0.4, 'THR:OG1': -0.4, 'TYR:OH': -0.4,
  'CYS:SG': -0.3,
  'ASN:OD1': -0.5, 'ASN:ND2': 0.4,
  'GLN:OE1': -0.5, 'GLN:NE2': 0.4,
};

const ELEMENT_FALLBACK_CHARGES: Record<string, number> = {
  O: -0.4,
  N: -0.3,
  S: -0.2,
  H: 0.15,
  C: 0.05,
};

/** Backbone atoms carry a small, roughly constant dipole contribution. */
const BACKBONE_CHARGES: Record<string, number> = {
  N: -0.35,
  O: -0.4,
  C: 0.4,
  CA: 0.0,
};

export function getPartialCharge(atom: Atom): number {
  const key = `${atom.residueName}:${atom.atomName}`;
  if (key in RESIDUE_ATOM_CHARGES) return RESIDUE_ATOM_CHARGES[key];
  if (atom.atomName in BACKBONE_CHARGES) return BACKBONE_CHARGES[atom.atomName];
  return ELEMENT_FALLBACK_CHARGES[atom.element] ?? 0;
}

const NEGATIVE_COLOR = { r: 0.85, g: 0.1, b: 0.1 };
const NEUTRAL_COLOR = { r: 0.9, g: 0.9, b: 0.9 };
const POSITIVE_COLOR = { r: 0.1, g: 0.3, b: 0.95 };

/** Maps a signed potential value to a red (negative) → white → blue (positive) gradient. */
export function potentialToColor(potential: number, maxAbs: number): [number, number, number] {
  const t = maxAbs > 0 ? Math.max(-1, Math.min(1, potential / maxAbs)) : 0;
  const from = t < 0 ? NEGATIVE_COLOR : POSITIVE_COLOR;
  const blend = Math.abs(t);
  return [
    NEUTRAL_COLOR.r + (from.r - NEUTRAL_COLOR.r) * blend,
    NEUTRAL_COLOR.g + (from.g - NEUTRAL_COLOR.g) * blend,
    NEUTRAL_COLOR.b + (from.b - NEUTRAL_COLOR.b) * blend,
  ];
}

/** Coulombic potential at a point from a set of point charges (Å units, unscaled). */
export function coulombPotentialAt(
  point: { x: number; y: number; z: number },
  charges: Array<{ x: number; y: number; z: number; q: number }>,
): number {
  let potential = 0;
  for (const c of charges) {
    const dx = point.x - c.x;
    const dy = point.y - c.y;
    const dz = point.z - c.z;
    const distSq = dx * dx + dy * dy + dz * dz;
    potential += c.q / Math.sqrt(distSq + 1.0); // +1 softens the singularity at r=0
  }
  return potential;
}
