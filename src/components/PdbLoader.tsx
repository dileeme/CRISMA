import { useState } from 'react';

interface PdbLoaderProps {
  onLoad: (pdbId: string) => void;
  loading: boolean;
}

export default function PdbLoader({ onLoad, loading }: PdbLoaderProps) {
  const [pdbId, setPdbId] = useState('1CRN');

  const submit = () => {
    if (pdbId.trim().length > 0) onLoad(pdbId);
  };

  return (
    <div className="flex items-center gap-2 p-3 bg-neutral-900 text-neutral-100">
      <label htmlFor="pdb-id" className="text-sm font-medium">
        PDB ID
      </label>
      <input
        id="pdb-id"
        value={pdbId}
        onChange={(e) => setPdbId(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        maxLength={4}
        placeholder="1CRN"
        className="w-24 px-2 py-1 rounded bg-neutral-800 border border-neutral-700 text-sm uppercase tracking-wide focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <button
        onClick={submit}
        disabled={loading}
        className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
      >
        {loading ? 'Loading…' : 'Load'}
      </button>
      <span className="text-xs text-neutral-400 ml-2">Try: 1CRN, 1BNA, 4HHB</span>
    </div>
  );
}
