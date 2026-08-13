const CPK_COLORS: Record<string, string> = {
  C: '#909090',
  N: '#3050f8',
  O: '#ff0d0d',
  S: '#ffff30',
  H: '#ffffff',
  P: '#ff8000',
  Ca: '#3dff00',
  Fe: '#e06633',
  Zn: '#7d80b0',
  Cl: '#1ff01f',
  Mg: '#8aff00',
  Na: '#ab5cf2',
};

const DEFAULT_COLOR = '#ff69b4';

export function getElementColor(element: string): string {
  return CPK_COLORS[element] ?? DEFAULT_COLOR;
}
