import type { Atom } from '../types/atom';

/**
 * Hand-rolled parser for the fixed-column PDB ATOM/HETATM format.
 * Column positions (1-indexed, per the PDB format spec):
 *   1-6   Record name ("ATOM  " / "HETATM")
 *   7-11  Serial number
 *   13-16 Atom name
 *   18-20 Residue name
 *   22    Chain ID
 *   31-38 X
 *   39-46 Y
 *   47-54 Z
 *   77-78 Element symbol (right-justified)
 */
export function parsePdb(text: string): Atom[] {
  const atoms: Atom[] = [];

  const lines = text.split('\n');
  for (const line of lines) {
    const recordName = line.slice(0, 6).trim();
    if (recordName !== 'ATOM' && recordName !== 'HETATM') continue;
    if (line.length < 54) continue;

    const x = parseFloat(line.slice(30, 38));
    const y = parseFloat(line.slice(38, 46));
    const z = parseFloat(line.slice(46, 54));
    if (Number.isNaN(x) || Number.isNaN(y) || Number.isNaN(z)) continue;

    const serial = parseInt(line.slice(6, 11).trim(), 10);
    const atomName = line.slice(12, 16).trim();
    const residueName = line.slice(17, 20).trim();
    const chainId = line.slice(21, 22).trim();

    let element = line.length >= 78 ? line.slice(76, 78).trim() : '';
    if (!element) {
      element = inferElementFromAtomName(atomName);
    }

    atoms.push({
      serial: Number.isNaN(serial) ? atoms.length + 1 : serial,
      atomName,
      element: normalizeElement(element),
      x,
      y,
      z,
      residueName,
      chainId,
      isHetatm: recordName === 'HETATM',
    });
  }

  return atoms;
}

function inferElementFromAtomName(atomName: string): string {
  const stripped = atomName.replace(/[0-9]/g, '').trim();
  return stripped.slice(0, atomName.startsWith(' ') ? 1 : 2) || stripped.slice(0, 1);
}

function normalizeElement(element: string): string {
  if (!element) return 'X';
  return element[0].toUpperCase() + element.slice(1).toLowerCase();
}
