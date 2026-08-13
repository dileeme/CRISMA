const PDB_ID_PATTERN = /^[a-zA-Z0-9]{4}$/;

export class PdbFetchError extends Error {}

export async function fetchPdbFile(pdbId: string): Promise<string> {
  const id = pdbId.trim().toUpperCase();

  if (!PDB_ID_PATTERN.test(id)) {
    throw new PdbFetchError(`"${pdbId}" is not a valid 4-character PDB ID.`);
  }

  const url = `https://files.rcsb.org/download/${id}.pdb`;

  let response: Response;
  try {
    response = await fetch(url);
  } catch {
    throw new PdbFetchError('Network error while contacting RCSB PDB. Check your connection and try again.');
  }

  if (response.status === 404) {
    throw new PdbFetchError(`No structure found for PDB ID "${id}".`);
  }
  if (response.status === 429) {
    throw new PdbFetchError('Rate limited by RCSB PDB. Please wait a moment and try again.');
  }
  if (!response.ok) {
    throw new PdbFetchError(`Failed to fetch "${id}": ${response.status} ${response.statusText}`);
  }

  const text = await response.text();
  if (!text || text.length === 0) {
    throw new PdbFetchError(`Received empty file for PDB ID "${id}".`);
  }

  return text;
}
