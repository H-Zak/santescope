# Phase 2: Scoring & Clustering - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-08
**Phase:** 02-scoring-clustering
**Areas discussed:** Score computation, Twin matching, Domino projection, JSON export

---

## Score Computation

### Weighting

| Option | Description | Selected |
|--------|-------------|----------|
| Equal weights (25% each) | Simpler, transparent for jury | ✓ |
| Custom weights | Weight some indicators more (e.g., APL) | |

**User's choice:** Equal weights — start simple in v1, revisit in v2 with domain expert input
**Notes:** User asked to note this as a v2 review item

### Null handling

| Option | Description | Selected |
|--------|-------------|----------|
| Score null if <3 components | Strict, honest — per SCORE-03 | ✓ |
| Score on available components | More communes scored, less reliable | |
| You decide | Claude chooses | |

**User's choice:** Score null if <3 components

### National average

| Option | Description | Selected |
|--------|-------------|----------|
| Median across communes | Robust to outliers | ✓ |
| Population-weighted mean | Reflects average French person experience | |
| Simple mean | Arithmetic mean, simple | |

**User's choice:** Median — also noted as a v2 review item (compare methods later)

### Classification

| Option | Description | Selected |
|--------|-------------|----------|
| 3 levels (vert/orange/rouge) | Simple for frontend | |
| 5 levels (A-E like energy rating) | Like DPE, familiar for elected officials | ✓ |
| Score only, no classification | Raw 0-10, continuous color interpolation | |

**User's choice:** 5 levels A-E

### Rounding

| Option | Description | Selected |
|--------|-------------|----------|
| 1 decimal (7.2) | Matches JSON contract | ✓ |
| Integer (7) | Simpler but less granular | |

**User's choice:** 1 decimal

### A-E thresholds

| Option | Description | Selected |
|--------|-------------|----------|
| Linear (A:0-2, B:2-4, etc.) | Regular, easy to explain | |
| Quintile-based | Each class ~20% of communes | |
| You decide | Claude chooses based on distribution | ✓ |

**User's choice:** Claude decides — must document choice and rationale. Noted as v2 review item.

### APL inversion

| Option | Description | Selected |
|--------|-------------|----------|
| APL inverse before normalization | 1/APL or (max - APL) | |
| Inversion in normalization formula | (max - x) / (max - min) | |
| You decide | Claude chooses cleanest method | ✓ |

**User's choice:** Claude decides

---

## Twin Matching

### Similarity metric

| Option | Description | Selected |
|--------|-------------|----------|
| Euclidean on normalized indicators | Simple, interpretable | ✓ |
| Cosine similarity | Less sensitive to absolute scale | |
| You decide | | |

**User's choice:** Euclidean on normalized indicators

### Improvement detection

| Option | Description | Selected |
|--------|-------------|----------|
| MSP presence + APL increase >0.3 | Per TWIN-02 | |
| Score improvement >1 point | Recalculate historical score | |
| You decide | Claude chooses based on available data | ✓ |

**User's choice:** Claude decides

### Geographic filter

| Option | Description | Selected |
|--------|-------------|----------|
| No filter (national) | Best for finding improvements | |
| Same region priority | Region first, then national | ✓ |
| Same department only | Very local, risk of too few twins | |

**User's choice:** Same region priority

### Number of twins

| Option | Description | Selected |
|--------|-------------|----------|
| Top 3 | Compact | |
| Top 5 | Per TWIN-01 | |
| Top 5, show 3 by default | Store 5, display 3 + "Voir plus" | ✓ |

**User's choice:** Top 5, show 3 by default

---

## Domino Projection

### 55+ estimation method

| Option | Description | Selected |
|--------|-------------|----------|
| Department average applied to commune count | Per DOM-01 | ✓ |
| You decide | | |

**User's choice:** Department average applied to commune count

### Alert trigger

| Option | Description | Selected |
|--------|-------------|----------|
| % 55+ exceeds department average | Per DOM-03 | |
| % 55+ exceeds 40% | Fixed threshold | |
| Both: dept avg AND fixed seuil | Double safety net | ✓ |

**User's choice:** Both — alert if >dept avg OR >50%

### Projection format

| Option | Description | Selected |
|--------|-------------|----------|
| Simple text: '-N medecins (estimation)' | Per JSON contract | ✓ |
| Range: '-N a -M medecins' | Low/high retirement age | |
| You decide | | |

**User's choice:** Simple text

---

## JSON Export

### Null/incomplete communes

| Option | Description | Selected |
|--------|-------------|----------|
| Export all, null fields kept as null | >35K files | |
| Only export communes with score | ~90% of communes | |
| Export all but flag incomplete | data_quality field | ✓ |

**User's choice:** Export all with data_quality flag

### Index.json content

| Option | Description | Selected |
|--------|-------------|----------|
| Score + classification | Frontend doesn't recompute thresholds | ✓ |
| Score only | More flexible for threshold changes | |

**User's choice:** Score + classification in index.json

### Validation

| Option | Description | Selected |
|--------|-------------|----------|
| Assert on 5 spot-check communes | Quick, sufficient for hackathon | |
| JSON Schema validation on all files | jsonschema.validate() on each | ✓ |
| You decide | | |

**User's choice:** Full JSON Schema validation on all files

---

## Claude's Discretion

- APL inversion method
- A-E classification thresholds (must document rationale)
- Twin improvement detection signals
- Clustering algorithm choice

## Deferred Ideas

- Custom score weighting with domain expert input — v2
- Population-weighted national average as alternative — v2
- ML-learned score weights — out of scope
- CartoSante API integration — v2
