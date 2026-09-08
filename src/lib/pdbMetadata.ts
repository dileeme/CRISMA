import type { EntryMetadata } from '../types/metadata';
import { PdbFetchError } from './pdbFetch';

const GRAPHQL_URL = 'https://data.rcsb.org/graphql';

const QUERY = `
  query ($id: String!) {
    entry(entry_id: $id) {
      struct { title }
      struct_keywords { pdbx_keywords }
      exptl { method }
      rcsb_accession_info { deposit_date initial_release_date }
      refine { ls_R_factor_R_free ls_R_factor_R_work ls_R_factor_obs }
      rcsb_entry_info { resolution_combined }
      database_2 { database_id pdbx_DOI }
      audit_author { name }
      pdbx_vrpt_summary_geometry {
        clashscore
        percent_ramachandran_outliers
        percent_rotamer_outliers
      }
      pdbx_vrpt_summary_diffraction { DCC_Rfree percent_RSRZ_outliers }
      pdbx_vrpt_summary { RNA_suiteness }
      polymer_entities {
        rcsb_entity_source_organism { ncbi_scientific_name }
        rcsb_polymer_entity { pdbx_mutation }
      }
    }
  }
`;

interface GraphqlEntry {
  struct: { title: string | null } | null;
  struct_keywords: { pdbx_keywords: string | null } | null;
  exptl: { method: string | null }[] | null;
  rcsb_accession_info: { deposit_date: string | null; initial_release_date: string | null } | null;
  refine: { ls_R_factor_R_free: number | null; ls_R_factor_R_work: number | null; ls_R_factor_obs: number | null }[] | null;
  rcsb_entry_info: { resolution_combined: number[] | null } | null;
  database_2: { database_id: string; pdbx_DOI: string | null }[] | null;
  audit_author: { name: string }[] | null;
  pdbx_vrpt_summary_geometry: {
    clashscore: number | null;
    percent_ramachandran_outliers: number | null;
    percent_rotamer_outliers: number | null;
  }[] | null;
  pdbx_vrpt_summary_diffraction: { DCC_Rfree: number | null; percent_RSRZ_outliers: number | null }[] | null;
  pdbx_vrpt_summary: { RNA_suiteness: number | null } | null;
  polymer_entities: {
    rcsb_entity_source_organism: { ncbi_scientific_name: string }[] | null;
    rcsb_polymer_entity: { pdbx_mutation: string | null } | null;
  }[] | null;
}

export async function fetchEntryMetadata(pdbId: string): Promise<EntryMetadata> {
  const id = pdbId.trim().toUpperCase();

  let response: Response;
  try {
    response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: QUERY, variables: { id } }),
    });
  } catch {
    throw new PdbFetchError('Network error while contacting RCSB PDB metadata service.');
  }

  if (!response.ok) {
    throw new PdbFetchError(`Failed to fetch metadata for "${id}": ${response.status} ${response.statusText}`);
  }

  const json = await response.json();
  const entry: GraphqlEntry | null = json?.data?.entry ?? null;
  if (!entry) {
    throw new PdbFetchError(`No metadata found for PDB ID "${id}".`);
  }

  const doiRecord = entry.database_2?.find((d) => d.pdbx_DOI);
  const refine = entry.refine?.[0] ?? null;
  const geometry = entry.pdbx_vrpt_summary_geometry?.[0] ?? null;
  const diffraction = entry.pdbx_vrpt_summary_diffraction?.[0] ?? null;

  const organisms = Array.from(
    new Set(
      (entry.polymer_entities ?? []).flatMap(
        (e) => e.rcsb_entity_source_organism?.map((o) => o.ncbi_scientific_name) ?? [],
      ),
    ),
  );

  const mutations = (entry.polymer_entities ?? []).some(
    (e) => !!e.rcsb_polymer_entity?.pdbx_mutation && e.rcsb_polymer_entity.pdbx_mutation !== 'NO',
  );

  return {
    entryId: id,
    title: entry.struct?.title ?? null,
    doi: doiRecord ? `https://doi.org/${doiRecord.pdbx_DOI}` : null,
    classification: entry.struct_keywords?.pdbx_keywords ?? null,
    organisms,
    mutations,
    depositDate: entry.rcsb_accession_info?.deposit_date ?? null,
    releaseDate: entry.rcsb_accession_info?.initial_release_date ?? null,
    depositionAuthors: entry.audit_author?.map((a) => a.name) ?? [],
    method: entry.exptl?.[0]?.method ?? null,
    resolution: entry.rcsb_entry_info?.resolution_combined?.[0] ?? null,
    rFree: refine?.ls_R_factor_R_free ?? null,
    rWork: refine?.ls_R_factor_R_work ?? null,
    rObserved: refine?.ls_R_factor_obs ?? null,
    validation: {
      rFreeDcc: diffraction?.DCC_Rfree ?? null,
      clashscore: geometry?.clashscore ?? null,
      ramachandranOutliers: geometry?.percent_ramachandran_outliers ?? null,
      sidechainOutliers: geometry?.percent_rotamer_outliers ?? null,
      rsrzOutliers: diffraction?.percent_RSRZ_outliers ?? null,
      rnaSuiteness: entry.pdbx_vrpt_summary?.RNA_suiteness ?? null,
    },
  };
}
