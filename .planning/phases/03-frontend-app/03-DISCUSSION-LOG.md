# Phase 3: Frontend App - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-08
**Phase:** 03-frontend-app
**Areas discussed:** Identite visuelle, Experience recherche, Layout double-panel, Carte & PDF, Routing & navigation, Domino & alertes visuelles, Responsive / mobile, Performance & loading

---

## Identite visuelle

### Ton visuel

| Option | Description | Selected |
|--------|-------------|----------|
| Institutionnel sobre | Bleu/gris, Inter/DM Sans, data.gouv.fr style | |
| Moderne data-viz | Indigo/cyan, gradients, Vercel dashboard style | |
| Sante DPE-colore | Teal + DPE A-E colors, carte vitale meets DPE | ✓ |

**User's choice:** Sante DPE-colore
**Notes:** Couleurs DPE parlent immediatement aux elus

### UI Framework

| Option | Description | Selected |
|--------|-------------|----------|
| Tailwind + shadcn/ui | Composants headless, rapide, standard Next.js | ✓ |
| Tailwind pur | Plus de controle, plus de code | |
| Chakra UI | Design system complet, plus opinionated | |

**User's choice:** Tailwind + shadcn/ui

### Langue interface

| Option | Description | Selected |
|--------|-------------|----------|
| Francais uniquement | Tout en FR, coherent avec public cible | ✓ |
| FR avec code EN | Interface FR, variables EN | |

**User's choice:** Francais uniquement

---

## Experience recherche

### Autocomplete dropdown

| Option | Description | Selected |
|--------|-------------|----------|
| Nom + dept + score | Badge A-E colore a droite, differencie homonymes | ✓ |
| Nom + dept seulement | Plus simple, score apres selection | |
| Nom + dept + population | Aide a identifier sans spoiler diagnostic | |

**User's choice:** Nom + dept + score

### Landing page

| Option | Description | Selected |
|--------|-------------|----------|
| Search hero plein ecran | Grande barre centree + tagline + stats | ✓ |
| Search + carte de France | Barre + carte coloree par score | |
| Search minimaliste | Logo + barre seulement | |

**User's choice:** Search hero plein ecran

### Performance recherche

| Option | Description | Selected |
|--------|-------------|----------|
| Client-side filter | index.json au mount, filter memoire, debounce 150ms | ✓ |
| Fuse.js fuzzy search | Tolere fautes de frappe, plus lourd | |
| Tu decides | Claude choisit | |

**User's choice:** Client-side filter

---

## Layout double-panel

### Disposition panels

| Option | Description | Selected |
|--------|-------------|----------|
| Side-by-side 50/50 | Deux colonnes egales, comparaison immediate | ✓ |
| Panel gauche large + sidebar | 65/35, accent sur diagnostic | |
| Tabs (un seul panel) | Onglets, plus simple petit ecran | |

**User's choice:** Side-by-side 50/50

### Visualisation score

| Option | Description | Selected |
|--------|-------------|----------|
| Badge DPE + jauge | Badge A-E + barre horizontale + note + label | ✓ |
| Score circulaire | Donut chart, plus moderne | |
| Nombre + couleur simple | Minimaliste | |

**User's choice:** Badge DPE + jauge

### Jumelles alternatives

| Option | Description | Selected |
|--------|-------------|----------|
| Barre sous les panels | Rangee horizontale de cartes miniatures, clic = swap | ✓ |
| Dropdown dans le panel droit | Select en haut du panel jumelle | |
| Sidebar depliable | Liste verticale retractable a droite | |

**User's choice:** Barre sous les panels

### Donnees incompletes

| Option | Description | Selected |
|--------|-------------|----------|
| Banniere warning + sections grisees | Banniere jaune + composantes manquantes grisees | ✓ |
| Tout afficher + asterisques | Afficher ce qui existe, * sur estimations | |
| Tu decides | Claude choisit | |

**User's choice:** Banniere warning + sections grisees

---

## Carte & PDF

### Type de carte

| Option | Description | Selected |
|--------|-------------|----------|
| Leaflet + marker | OpenStreetMap, gratuit, interactif | |
| Carte statique (image) | PNG genere par notebook, zero JS supplementaire | ✓ |
| Mapbox GL | Plus beau, necessite token API | |

**User's choice:** Carte statique (image)
**Notes:** Simplifie beaucoup le frontend, carte pre-generee dans notebooks

### Mode comparaison libre

| Option | Description | Selected |
|--------|-------------|----------|
| Bouton "Comparer" sur page resultat | 2e champ de recherche, remplace jumelle | ✓ |
| 2e barre de recherche sur landing | Deux champs sur accueil | |
| URL directe | /comparer/a/b, pas decouvreable dans UI | |

**User's choice:** Bouton "Comparer" sur page resultat

### Export PDF

| Option | Description | Selected |
|--------|-------------|----------|
| html2canvas basique | Screenshot zone comparaison | |
| html2canvas + titre/date | Meme + header ajoute | |
| Tu decides | Claude choisit polish | |

**User's choice:** (Other) PDF style ORS/ARS institutionnel suivant mockup.html — dark theme, resume executif, indicateurs cles, scores par dimension, points forts/alertes, footer sources. Adapter 12 dimensions → 4 composantes.
**Notes:** User provided mockup.html with complete HTML/CSS template. Reference: fiches ORS/profils ARS.

### Theme PDF vs App

| Option | Description | Selected |
|--------|-------------|----------|
| PDF dark, app light | Deux ambiances distinctes | ✓ |
| Dark partout | Meme theme | |
| Light partout | PDF passe en light | |

**User's choice:** PDF dark, app light

---

## Routing & navigation

### Structure URLs

| Option | Description | Selected |
|--------|-------------|----------|
| Simple et partageable | /, /commune/[code], /comparer/[a]/[b] | ✓ |
| Hash-based SPA | /#/commune/02691, tout client-side | |
| Tu decides | Claude optimise | |

**User's choice:** Simple et partageable
**Notes:** Logo → retour accueil, barre de recherche persistante en header

---

## Domino & alertes visuelles

### Alerte domino

| Option | Description | Selected |
|--------|-------------|----------|
| Encart alerte colore | Bloc orange/rouge avec stats et projection 2030 | ✓ |
| Integre dans les stats | Ligne discrete dans section medecins | |
| Tu decides | Claude juge | |

**User's choice:** Encart alerte colore

### Specialites manquantes

| Option | Description | Selected |
|--------|-------------|----------|
| Liste a puces avec contexte | Bullet + lien pathologie dept | ✓ |
| Tags colores | Badges rouges compacts | |
| Tu decides | Claude choisit | |

**User's choice:** Liste a puces avec contexte

---

## Responsive / mobile

### Comportement mobile

| Option | Description | Selected |
|--------|-------------|----------|
| Stack vertical sur mobile | <768px: panels empiles, desktop: side-by-side | ✓ |
| Desktop-only, ignorer mobile | Pas de media queries | |
| Tabs sur mobile | Onglets sur mobile | |

**User's choice:** Stack vertical sur mobile

---

## Performance & loading

### Strategie chargement

| Option | Description | Selected |
|--------|-------------|----------|
| Index au mount + commune a la demande | index.json au startup, commune JSON au clic, skeleton loading | ✓ |
| Tout lazy, rien au mount | Index fetche au premier keystroke | |
| Tu decides | Claude optimise | |

**User's choice:** Index au mount + commune a la demande

---

## Claude's Discretion

- shadcn/ui component selection
- Search filtering algorithm details
- Skeleton component design
- Mock data structure (3-5 hardcoded communes)
- Responsive breakpoints details
- html2canvas configuration

## Deferred Ideas

- Interactive Leaflet/Mapbox map — V2
- Fuzzy search (Fuse.js) — V2
- Dark mode for app — V2
- Styled PDF with proper PDF library — V2
