export interface IndexEntry {
  code: string;
  nom: string;
  dept: string;
  score: number | null;
  classe: "A" | "B" | "C" | "D" | "E" | null;
  pop: number;
}

export interface CommuneData {
  code: string;
  nom: string;
  dept: string;
  region: string;
  pop: number;
  score: number | null;
  classe: "A" | "B" | "C" | "D" | "E" | null;
  data_quality: "full" | "partial" | "minimal";
  score_detail: {
    apl: number;
    apl_national: number;
    pauvrete: number | null;
    pauvrete_national: number;
    pct_75_seuls: number;
    pct_75_seuls_national: number;
    temps_urgences_min: number;
    temps_urgences_national: number;
  };
  medecins: {
    generalistes: number;
    specialistes: Record<string, number>;
    total: number;
  };
  manques: string[] | null;
  domino: {
    pct_55plus: number;
    dept_avg: number;
    pertes_2030: number;
  } | null;
  jumelles: Array<{
    code: string;
    nom: string;
    similarite: number;
    actions: string[];
    apl_avant: number;
    apl_apres: number;
    has_msp: boolean;
  }>;
  msp_presente: boolean;
  apl_evolution: Record<string, number>;
  pathologies_dept: {
    diabete: number;
    cardiovasculaire: number;
    psychiatrique: number;
    cancers: number;
    respiratoire: number;
  };
  coords: [number, number];
}
