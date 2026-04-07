# Phase 1 Context: Data Foundation

## Locked Decisions

### Datasets (9 only, frozen)

| # | Dataset | Join Key | Notes |
|---|---------|----------|-------|
| 1 | APL (DREES) | code_commune | Direct. Multi-year for evolution. |
| 2 | RPPS (Annuaire Sante) | code_postal → code_commune via La Poste | 761 Mo CSV. Filter on active medecins. |
| 3 | FINESS (etablissements) | code_commune INSEE | Filter relevant categories. |
| 4 | MSP | commune field (verify code INSEE presence) | Signal for twin detection. |
| 5 | INSEE Population | DEPCOM (code_commune) | Pop + age structure. |
| 6 | FiLoSoFi (revenus) | code_commune | 2021 millesime only. |
| 7 | Pathologies (data.ameli) | code_departement | Department-level only. |
| 8 | Admin Express (IGN) | code_commune | GeoJSON for maps. |
| 9 | Diagnostic acces soins urgents | code_commune | XLS, temps acces urgences. |

Supplementary: **La Poste cp→commune correspondence table** (not a dataset per se, but required for RPPS join).

### Join Strategy

**Canonical key: `code_commune` (INSEE COG, 5 digits, e.g. "02691")**

All datasets join on code_commune except:
- RPPS: uses code_postal. Convert via La Poste/INSEE correspondence table. When 1 CP maps to multiple communes, assign to most populated commune. Expected loss: <2%.
- Pathologies: joins on code_departement (first 2-3 digits of code_commune). Applied at department level.

### Pipeline Architecture

```
notebooks/
├── 00_download.ipynb     → raw CSVs into data/raw/
├── 01_merge.ipynb        → clean + join → data/communes_master.parquet
├── 02_score.ipynb        → vulnerability score columns added
├── 03_domino.ipynb       → retirement + missing doctors columns
├── 04_jumelles.ipynb     → clustering + twin matching
├── 05_export_json.ipynb  → index.json + per-commune JSONs
└── data/
    ├── raw/              (gitignored)
    ├── processed/        (gitignored)
    └── la_poste_cp_commune.csv
```

Each notebook reads communes_master.parquet, adds columns, saves back. Linear pipeline, no cross-notebook dependencies except through the master parquet.

### Frontend Parallelization

Phase 3 starts Day 1 with mock data (3-5 hardcoded commune JSONs matching the frozen schema). It does NOT depend on Phase 1 completion. Real data replaces mock data in Phase 4.

### No Backend

All data is pre-computed in notebooks and exported as static JSON. Next.js reads JSON from public/data/. No API, no database, no server-side computation. Backend (FastAPI) is deferred to V2.

### JSON Contract (frozen)

```json
// public/data/index.json (~500Ko)
[{"code":"02691","nom":"Saint-Quentin","dept":"02","score":7.2,"pop":53000}, ...]

// public/data/communes/{code}.json (~2Ko each)
{
  "code": "02691",
  "nom": "Saint-Quentin",
  "dept": "02",
  "region": "Hauts-de-France",
  "pop": 53000,
  "score": 7.2,
  "score_detail": {
    "apl": 2.8, "apl_national": 3.9,
    "pauvrete": 0.28, "pauvrete_national": 0.14,
    "pct_75_seuls": 0.18, "pct_75_seuls_national": 0.11,
    "temps_urgences_min": 12, "temps_urgences_national": 15
  },
  "medecins": {
    "generalistes": 12,
    "specialistes": {"cardiologue": 2, "endocrinologue": 0, "psychiatre": 1},
    "total": 15
  },
  "manques": ["endocrinologue", "dermatologue"],
  "domino": {
    "medecins_55_plus": 3,
    "pct_55_plus": 0.25,
    "pct_55_plus_dept": 0.35,
    "projection_2030": "-3 medecins (estimation)"
  },
  "jumelles": [
    {
      "code": "59392", "nom": "Maubeuge", "similarite": 0.87,
      "score_avant": 7.8, "score_apres": 5.1,
      "actions": ["MSP installee en 2021", "APL: 2.5 -> 3.4"],
      "has_msp": true, "apl_evolution": {"2019": 2.5, "2023": 3.4}
    }
  ],
  "msp_presente": false,
  "apl_evolution": {"2019": 2.9, "2021": 2.8, "2023": 2.8},
  "pathologies_dept": {"diabete": 1.35, "cardiovasculaire": 1.28, "psychiatrique": 1.22},
  "coords": [49.8489, 3.2876]
}
```

### Known Failure Modes

1. **RPPS join loss**: ~1-2% of medecins lost in cp→commune conversion. Acceptable.
2. **COG vintage mismatch**: Commune codes may differ between dataset years. Use latest COG as reference, drop non-matching.
3. **FiLoSoFi frozen at 2021**: Accept the staleness, document it.
4. **MSP dataset may lack code_commune**: If only commune name, fuzzy-match to COG. Fallback: geocode via address if needed.
5. **Pathologies department-only**: Cross with commune's department code. Feature shows department-level rates applied to commune context.

## What Is NOT In This Phase

- Score computation (Phase 2)
- Twin matching (Phase 2)
- JSON export (Phase 2)
- Frontend anything (Phase 3)
- Deployment (Phase 4)
- Any of the 13 enrichment datasets

## Download URLs

See datasets-santescope.md for complete URLs. Key ones:
- APL: https://www.data.gouv.fr/datasets/laccessibilite-potentielle-localisee-apl/
- RPPS: https://www.data.gouv.fr/datasets/annuaire-sante-extractions-des-donnees-en-libre-acces-des-professionnels-intervenant-dans-le-systeme-de-sante-rpps
- FINESS: https://www.data.gouv.fr/datasets/finess-extraction-du-fichier-des-etablissements
- MSP: https://www.data.gouv.fr/datasets/maisons-de-sante-pluriprofessionnelles
- INSEE Pop: https://www.insee.fr/fr/statistiques/8680726
- FiLoSoFi: https://www.data.gouv.fr/datasets/revenus-et-pauvrete-des-menages-aux-niveaux-national-et-local-revenus-localises-sociaux-et-fiscaux
- Pathologies: https://data.ameli.fr/explore/dataset/effectifs/
- Admin Express: data.gouv.fr (GeoJSON communes)
- Diagnostic urgences: https://www.data.gouv.fr/datasets/diagnostic-dacces-aux-soins-urgents
