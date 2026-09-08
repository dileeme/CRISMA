import { useCallback, useState } from 'react';
import type { EntryMetadata } from '../types/metadata';
import { fetchEntryMetadata } from '../lib/pdbMetadata';
import { PdbFetchError } from '../lib/pdbFetch';

type Status = 'idle' | 'loading' | 'error' | 'success';

interface UseEntryMetadataResult {
  metadata: EntryMetadata | null;
  status: Status;
  error: string | null;
  load: (pdbId: string) => Promise<void>;
}

export function useEntryMetadata(): UseEntryMetadataResult {
  const [metadata, setMetadata] = useState<EntryMetadata | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (pdbId: string) => {
    setStatus('loading');
    setError(null);
    try {
      const data = await fetchEntryMetadata(pdbId);
      setMetadata(data);
      setStatus('success');
    } catch (err) {
      const message = err instanceof PdbFetchError ? err.message : 'Unexpected error loading metadata.';
      setError(message);
      setStatus('error');
      setMetadata(null);
    }
  }, []);

  return { metadata, status, error, load };
}
