# Phase 1 Validation: Data Foundation

## Validation Strategy

Inline assertions in notebooks. No formal test suite. Each notebook includes assert statements after critical operations. If an assertion fails, the notebook stops and the error is visible immediately.

## Automated Checks (inline in notebooks)

### 00_download.ipynb
- [ ] Each of 9 CSVs downloaded successfully (file exists, size > 0)
- [ ] La Poste correspondence table downloaded
- [ ] RPPS CSV readable with explicit encoding (UTF-8 or Latin-1)
- [ ] Row count sanity: RPPS > 1M rows, INSEE Pop > 30K rows, APL > 30K rows

### 01_merge.ipynb
- [ ] La Poste table loaded: >30K code_postal → code_commune mappings
- [ ] RPPS join success rate: >98% of medecins matched to a code_commune
- [ ] `assert len(rpps_joined) / len(rpps_raw) > 0.98`
- [ ] APL merge: >95% of APL communes found in INSEE Pop
- [ ] `assert len(merged) > 30000, f"Only {len(merged)} communes merged"`
- [ ] No commune has ALL null values for score components
- [ ] `assert merged[score_cols].isna().all(axis=1).sum() == 0`
- [ ] Master parquet saved successfully and re-readable
- [ ] Column list matches expected schema (print and visually confirm)

## Manual Checks

- [ ] Spot-check 5 known communes (Paris, Saint-Quentin, Maubeuge, Sedan, a rural commune)
  - Verify population looks right
  - Verify medecin count is plausible
  - Verify APL is not null
  - Verify pauvrete rate is not null
- [ ] Verify RPPS join didn't silently duplicate rows (assert unique on code_commune + medecin_id)
- [ ] Print null rate per column — no critical column should exceed 20% null

## Pass Criteria

Phase 1 is DONE when:
1. communes_master.parquet exists in data/processed/
2. >30K communes with at least 3 of 4 score components populated
3. RPPS join success >98%
4. All inline assertions pass without error
5. 5 spot-check communes look correct

## Known Acceptable Gaps

- FiLoSoFi data is from 2021 (2-3 year lag). Acceptable, documented.
- Pathologies are department-level, not commune. Acceptable, applied via dept code.
- ~1-2% of RPPS medecins lost in cp→commune join. Acceptable.
- Some tiny communes (<50 pop) may have no data for several indicators. Acceptable, will get score=null.
