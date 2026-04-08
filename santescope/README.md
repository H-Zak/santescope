# SanteScope

Jumeau numerique territorial pour la sante des communes francaises.
SanteScope identifie les fragilites sanitaires d'une commune et propose des pistes d'action inspirees de communes similaires qui ont ameliore leur situation.

## Demo

**URL** : https://santescope.vercel.app
**Pitch** : https://santescope.vercel.app/pitch/

## Fonctionnalites

- Recherche parmi 34 969 communes (autocomplete < 150ms)
- Diagnostic sante : score de vulnerabilite 0-10, detail des 4 composantes
- Projection "domino" : impact des departs a la retraite des medecins
- Jumelles territoriales : communes similaires ayant ameliore leur situation
- Comparaison libre entre 2 communes
- Export PDF du diagnostic

## Stack technique

Next.js 16 . TypeScript . Tailwind CSS . shadcn/ui . html2canvas

## Donnees ouvertes

| Source | Producteur | Utilisation |
|--------|-----------|-------------|
| APL | DREES | Accessibilite aux soins |
| RPPS | Sante.fr | Effectifs medicaux par commune |
| FiLoSoFi 2018 | INSEE | Taux de pauvrete |
| RP 2020 | INSEE | Structure d'age (75+) |
| SAE Urgences | DREES | Temps d'acces aux urgences |
| FINESS | Sante.gouv | Etablissements de sante |
| Pathologies | Ameli | Prevalence departementale |
| DREES Demographie | DREES | Age des medecins par dept |
| La Poste | La Poste | Code postal -> code commune |

## Methodologie

Le score de vulnerabilite combine 4 indicateurs normalises (min-max) :
1. APL inverse (accessibilite aux soins)
2. Taux de pauvrete
3. Part des 75+ vivant seuls
4. Temps d'acces aux urgences

Les jumelles sont identifiees par KNN sur 5 features normalisees avec priorite regionale.
Voir `notebooks/` pour le pipeline complet.

## Lancement local

```bash
git clone https://github.com/H-Zak/santescope.git
cd santescope
npm install
npm run dev
# Ouvrir http://localhost:3000
```
