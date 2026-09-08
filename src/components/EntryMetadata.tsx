import type { EntryMetadata as EntryMetadataType } from '../types/metadata';

interface EntryMetadataProps {
  metadata: EntryMetadataType;
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return iso.slice(0, 10);
}

function formatNumber(n: number | null, digits = 3): string {
  return n === null ? '—' : n.toFixed(digits);
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-0.5">
      <span className="text-neutral-400">{label}</span>
      <span className="text-neutral-100 text-right">{value}</span>
    </div>
  );
}

export default function EntryMetadata({ metadata: m }: EntryMetadataProps) {
  return (
    <div className="w-80 max-h-full overflow-y-auto rounded bg-neutral-900/95 border border-neutral-800 text-sm p-3 space-y-3">
      <div>
        <h2 className="text-neutral-100 font-semibold text-base">{m.entryId}</h2>
        {m.title && <p className="text-neutral-400 text-xs mt-0.5">{m.title}</p>}
      </div>

      <div className="space-y-0.5">
        <Row
          label="PDB DOI"
          value={
            m.doi ? (
              <a href={m.doi} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline break-all">
                {m.doi}
              </a>
            ) : (
              '—'
            )
          }
        />
        <Row label="Classification" value={m.classification ?? '—'} />
        <Row label="Organism(s)" value={m.organisms.length > 0 ? m.organisms.join(', ') : '—'} />
        <Row label="Mutation(s)" value={m.mutations ? 'Yes' : 'No'} />
        <Row label="Deposited" value={formatDate(m.depositDate)} />
        <Row label="Released" value={formatDate(m.releaseDate)} />
        <Row
          label="Deposition Author(s)"
          value={m.depositionAuthors.length > 0 ? m.depositionAuthors.join(', ') : '—'}
        />
      </div>

      <div className="border-t border-neutral-800 pt-2 space-y-0.5">
        <h3 className="text-neutral-300 font-medium mb-1">Experimental Data</h3>
        <Row label="Method" value={m.method ?? '—'} />
        <Row label="Resolution" value={m.resolution !== null ? `${m.resolution.toFixed(2)} Å` : '—'} />
        <Row label="R-Value Free" value={formatNumber(m.rFree)} />
        <Row label="R-Value Work" value={formatNumber(m.rWork)} />
        <Row label="R-Value Observed" value={formatNumber(m.rObserved)} />
      </div>

      <div className="border-t border-neutral-800 pt-2 space-y-0.5">
        <h3 className="text-neutral-300 font-medium mb-1">wwPDB Validation</h3>
        <Row label="Rfree (DCC)" value={formatNumber(m.validation.rFreeDcc)} />
        <Row label="Clashscore" value={m.validation.clashscore ?? '—'} />
        <Row
          label="Ramachandran outliers"
          value={m.validation.ramachandranOutliers !== null ? `${m.validation.ramachandranOutliers}%` : '—'}
        />
        <Row
          label="Sidechain outliers"
          value={m.validation.sidechainOutliers !== null ? `${m.validation.sidechainOutliers}%` : '—'}
        />
        <Row
          label="RSRZ outliers"
          value={m.validation.rsrzOutliers !== null ? `${m.validation.rsrzOutliers}%` : '—'}
        />
        <Row label="RNA backbone" value={m.validation.rnaSuiteness ?? '—'} />
      </div>
    </div>
  );
}
