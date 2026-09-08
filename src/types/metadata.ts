export interface EntryMetadata {
  entryId: string;
  title: string | null;
  doi: string | null;
  classification: string | null;
  organisms: string[];
  mutations: boolean;
  depositDate: string | null;
  releaseDate: string | null;
  depositionAuthors: string[];
  method: string | null;
  resolution: number | null;
  rFree: number | null;
  rWork: number | null;
  rObserved: number | null;
  validation: {
    rFreeDcc: number | null;
    clashscore: number | null;
    ramachandranOutliers: number | null;
    sidechainOutliers: number | null;
    rsrzOutliers: number | null;
    rnaSuiteness: number | null;
  };
}
