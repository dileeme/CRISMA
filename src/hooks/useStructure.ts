import { useCallback, useState } from 'react';
import type { Atom } from '../types/atom';
import { fetchPdbFile, PdbFetchError } from '../lib/pdbFetch';
import { parsePdb } from '../lib/pdbParse';

type Status = 'idle' | 'loading' | 'error' | 'success';

interface UseStructureResult {
  atoms: Atom[];
  status: Status;
  error: string | null;
  load: (pdbId: string) => Promise<void>;
}

export function useStructure(): UseStructureResult {
  const [atoms, setAtoms] = useState<Atom[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (pdbId: string) => {
    setStatus('loading');
    setError(null);
    try {
      const text = await fetchPdbFile(pdbId);
      const parsed = parsePdb(text);
      if (parsed.length === 0) {
        throw new PdbFetchError(`No ATOM/HETATM records found for "${pdbId}".`);
      }
      setAtoms(parsed);
      setStatus('success');
    } catch (err) {
      const message = err instanceof PdbFetchError ? err.message : 'Unexpected error loading structure.';
      setError(message);
      setStatus('error');
      setAtoms([]);
    }
  }, []);

  return { atoms, status, error, load };
}
