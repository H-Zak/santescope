# SanteScope - Master Liste des Datasets

## CONFIRMES - Coeur du MVP

| # | Dataset | Source | Maille | Format | Jointure | Fraicheur | Usage dans SanteScope |
|---|---------|--------|--------|--------|----------|-----------|----------------------|
| 1 | APL (Accessibilite Potentielle Localisee) | DREES / data.gouv.fr | Commune | CSV | Code commune | 2023 | Score acces soins, evolution temporelle |
| 2 | RPPS (Annuaire Sante) | data.gouv.fr | Adresse | CSV | Code postal (conversion via table INSEE) | Mars 2026 | Medecins par commune + specialite + nouveaux installes (via date debut exercice) |
| 3 | FINESS (etablissements sante) | data.gouv.fr | Commune | CSV | Code commune INSEE | Continu | Hopitaux, centres sante, EHPAD |
| 4 | MSP (Maisons de Sante Pluriprofessionnelles) | data.gouv.fr | Commune | CSV | Commune (verifier code INSEE) | 2025 | Signal "bonne pratique" pour communes jumelles |
| 5 | INSEE Population | insee.fr / data.gouv.fr | Commune | CSV | Code commune INSEE (DEPCOM) | 2023 | Population, structure age (% +65, +75 ans) |
| 6 | FiLoSoFi (revenus, pauvrete) | INSEE | Commune + IRIS | CSV | Code commune / Code IRIS | 2021 | Taux pauvrete, niveau de vie |
| 7 | Pathologies par territoire | data.ameli.fr | Departement/Region | CSV/JSON | Code departement | 2023 | Type de medecins manquants (croise avec RPPS) |
| 8 | Admin Express (decoupages geo) | IGN | Commune | GeoJSON/SHP | Code commune | 2026 | Fond de carte |

## CONFIRMES - Enrichissement MVP

| # | Dataset | Source | Maille | Format | Jointure | Fraicheur | Usage |
|---|---------|--------|--------|--------|----------|-----------|-------|
| 9 | DREES demographie medecins (age) | data.drees | Departement | CSV | Code departement | 2025 | Effet domino (% medecins +55 ans par dept, applique aux medecins RPPS de la commune) |
| 10 | CartoSante API (300+ indicateurs) | atlasante.fr | Commune | API REST (Geoclip) | Code commune | Continu | Indicateurs sante, zonages, densites. SOURCE CLE. |
| 11 | Zonage ARS (ZIP/ZAC) via CartoSante | atlasante.fr API | Commune | JSON via API | Code commune | 2026 | Commune classee "desert medical" officiel |
| 12 | Installations MG zones sous-dotees | data.ameli.fr | Departement | CSV/JSON | Code departement | 2025 | Signal d'action (installations aidees) |
| 13 | Contours IRIS | IGN | IRIS | GeoJSON | Code IRIS | 2026 | Carte fine infra-communale |
| 14 | QPV (quartiers prioritaires) | ANCT / data.gouv.fr | Quartier | GeoJSON | Geometrie | 2026 | Vulnerabilite sociale |
| 15 | **Diagnostic acces soins urgents** | data.gouv.fr | **Commune** | XLS | Code commune | 2021 | Temps d'acces aux urgences par commune. PEPITE. |
| 16 | **CPTS via FINESS cat. 604** | FINESS (deja dans #3) | Commune | CSV | Filtre categorie 604 | Continu | Liste CPTS + commune d'implantation |
| 17 | **File active moyenne MG** | data.ameli.fr | Departement | CSV/API | Code departement | 2025 | Proxy saturation medecins (nb patients/medecin) |
| 18 | **Patientele medecin traitant** | data.ameli.fr | Departement | CSV/API | Code departement | 2025 | % patients sans medecin traitant |
| 19 | **Primo-installations generalistes** | data.ameli.fr | Departement | CSV/API | Code departement | 2026 | Signal attractivite : ou s'installent les nouveaux medecins |
| 20 | **Passages urgences 2017-2023** | DREES / data.gouv.fr | Departement | CSV | Code departement | 2024 | Proxy manque soins premier recours |
| 21 | **Annuaire Sante Ameli (GPS)** | data.gouv.fr | Adresse GPS | CSV | Geocodable commune | Avril 2026 | Medecins + secteur + tarifs, geolocalisables |
| 22 | **Lieux consultation solidaire** | sante.fr / data.gouv.fr | Commune | CSV | Geocodable | 2026 | Points consultation publics precaires |

## CONFIRMES - V2 / Perspectives (hors scope MVP)

| # | Dataset | Source | Maille | Format | Jointure | Fraicheur | Usage V2 |
|---|---------|--------|--------|--------|----------|-----------|----------|
| 15 | DVF (prix immobilier) agrege | Caisse des Depots opendata | Commune | CSV | Code commune INSEE | 2025 | Attractivite commune pour medecins |
| 16 | BPE (Base Permanente Equipements) | INSEE | Commune + IRIS | CSV | Code commune INSEE | 2024 | 229 types equipements (ecoles, commerces, pharmacies) = attractivite |
| 17 | Assistants medicaux (contrats) | data.ameli.fr | Departement | CSV | Code departement | 2024 | Nouvelles pratiques |
| 18 | Green Data for Health | ecologie.gouv.fr | Variable | Catalogue (130 datasets) | Variable | Variable | Dimension environnement-sante |

## NON DISPONIBLES / LIMITES

| Donnee souhaitee | Statut | Explication |
|-----------------|--------|-------------|
| Delais d'attente RDV par commune | PAS DE DONNEE | Enquete DREES ponctuelle 2016-2017, pas de CSV par territoire |
| CPTS liste nationale | FRAGMENTEE | Pas de CSV national, chaque ARS publie sa propre carte |
| CLS (Contrats Locaux Sante) | CARTE SEULEMENT | Carte interactive ARS, pas de CSV |
| Pathologies par commune | IMPOSSIBLE | Secret statistique, seul le departement est publie |
| Age exact des medecins par commune | INDIRECT | DREES = departement, RPPS = pas d'age direct. Contournement : date diplome ou appliquer stats dept |

## URLS CLES

- APL : https://www.data.gouv.fr/datasets/laccessibilite-potentielle-localisee-apl/
- RPPS : https://www.data.gouv.fr/datasets/annuaire-sante-extractions-des-donnees-en-libre-acces-des-professionnels-intervenant-dans-le-systeme-de-sante-rpps
- FINESS : https://www.data.gouv.fr/datasets/finess-extraction-du-fichier-des-etablissements
- MSP : https://www.data.gouv.fr/datasets/maisons-de-sante-pluriprofessionnelles
- INSEE Pop : https://www.insee.fr/fr/statistiques/8680726?sommaire=8681011
- FiLoSoFi : https://www.data.gouv.fr/datasets/revenus-et-pauvrete-des-menages-aux-niveaux-national-et-local-revenus-localises-sociaux-et-fiscaux
- Pathologies : https://data.ameli.fr/explore/dataset/effectifs/
- Admin Express : https://www.data.gouv.fr/datasets/admin-express-1
- CartoSante API : https://cartosante.atlasante.fr/api/v1/doc/api_metadata.html
- DVF commune : https://opendata.caissedesdepots.fr/explore/dataset/donnees-valeurs-foncieres-a-la-commune/
- BPE : https://www.insee.fr/fr/statistiques/8217537
- Data Ameli Observatoire : https://data.ameli.fr/pages/acces-aux-soins/
- Carte CLS : https://www.ars.sante.fr/index.php/la-carte-des-contrats-locaux-de-sante

## LIMITATIONS CONNUES

1. **FiLoSoFi gele** : dernier millesime = 2021, pas de calendrier de reprise
2. **FDep obsolete** : dernier calcul = 2013 (recalculable avec les 4 variables INSEE)
3. **Pathologies** : departement seulement, pas commune (secret statistique)
4. **Age medecins** : departement via DREES, approximable en croisant avec RPPS
5. **Delais d'attente** : aucune donnee open data a la commune
6. **FINESS en transition** : nouveau flux prevu ete 2026
7. **CPTS/CLS** : pas de fichier national structure, chaque ARS fait le sien

## TROUVAILLE CLE

**CartoSante / AtlaSante** (https://cartosante.atlasante.fr) dispose d'une API REST (Geoclip) 
avec 300+ indicateurs sante a la maille commune, incluant les zonages ZIP/ZAC. 
C'est potentiellement la source la plus riche pour SanteScope, permettant de recuperer 
en une seule API la plupart des indicateurs dont on a besoin.
Licence Ouverte v2.0 = exploitable librement.
