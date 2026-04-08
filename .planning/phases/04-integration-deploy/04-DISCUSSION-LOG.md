# Phase 4: Integration & Deploy - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-08
**Phase:** 04-integration-deploy
**Areas discussed:** Polish UX, Stratégie de déploiement, Soumission hackathon, Smoke test & démo

---

## Polish UX

| Option | Description | Selected |
|--------|-------------|----------|
| Smoke test only | Vérifier que rien ne crashe, fixer uniquement bugs bloquants | |
| Polish ciblé | Smoke test + corrections visuelles ciblées (~2-3h) | ✓ |
| Polish complet | Smoke test + polish visuel + micro-interactions (~4-5h) | |

**User's choice:** Polish ciblé
**Notes:** Aucun bug connu — découvrir au smoke test. Priorité : vérifier tout (données manquantes, visuel, impact jury) sans compromis.

---

## Stratégie de déploiement

### Servir les 35K JSONs

| Option | Description | Selected |
|--------|-------------|----------|
| Static dans public/ | Garder tel quel, CDN-caché, zéro config | ✓ |
| API route | Route handler /api/commune/[code] | |
| Bundle un fichier | Fusionner en un gros fichier ~40Mo | |

**User's choice:** Static dans public/

### Domaine

| Option | Description | Selected |
|--------|-------------|----------|
| URL Vercel par défaut | santescope.vercel.app, gratuit, immédiat | ✓ |
| Domaine perso | Acheter un domaine (~10€) | |

**User's choice:** URL Vercel par défaut

### Data & Git

| Option | Description | Selected |
|--------|-------------|----------|
| Commit dans git | Ajouter public/data/ au repo (~40Mo) | ✓ |
| Build step notebook | Re-générer les JSONs sur Vercel | |
| Upload séparé | CDN externe (R2, S3) | |

**User's choice:** Commit dans git

---

## Soumission hackathon

### Contenu exigé

| Option | Description | Selected |
|--------|-------------|----------|
| Je ne sais pas encore | Préparer le minimum standard | ✓ |
| J'ai les infos | Détailler les critères connus | |

**User's choice:** Préparer le minimum standard, ajuster quand les règles seront claires

### Niveau de documentation

| Option | Description | Selected |
|--------|-------------|----------|
| README essentiel | Description, stack, screenshots, URL (~30min) | |
| README + vidéo démo | + screen recording 2-3min (~1h de plus) | |
| Dossier complet | README + vidéo + slides pitch | ✓ |

**User's choice:** Dossier complet

### Outil slides

| Option | Description | Selected |
|--------|-------------|----------|
| Google Slides / Canva | Externe, contenu préparé par Claude | |
| HTML/Reveal.js dans le repo | Page codée, versionnée | ✓ |
| On verra plus tard | Focus déploiement d'abord | |

**User's choice:** HTML/Reveal.js dans le repo

---

## Smoke test & démo

### Communes de test

| Option | Description | Selected |
|--------|-------------|----------|
| 5 suggérées | Paris, Saint-Quentin, Maubeuge, Sedan + rurale | ✓ |
| Choisir soi-même | Proposer d'autres communes | |

**User's choice:** Garder les 5 suggérées

### Niveau de vérification

| Option | Description | Selected |
|--------|-------------|----------|
| Vérif manuelle rapide | Navigation des 5 communes ~15min | |
| Automatisée + manuelle | Script fetch + vérif champs + navigation visuelle | ✓ |
| QA complète /qa | Browser headless systématique ~30min | |

**User's choice:** Vérification automatisée + manuelle

---

## Claude's Discretion

- Choix de la commune rurale (5e test)
- Configuration Vercel
- Setup Reveal.js et structure slides
- Outil screen recording
- Ordre des corrections polish

## Deferred Ideas

None — discussion stayed within phase scope
