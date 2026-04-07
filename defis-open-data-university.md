# Open Data University - Analyse des 8 Defis (Saison 4)

**Hackathon** : 7 avril - 13 avril 2026
**Demo Day** : 8-9 juin 2026
**Equipe** : max 5 personnes
**Criteres** : Excellence technique, UX, Originalite (angles morts)

---

## 1. L'impact environnemental de l'IA generative

- **Partenaire** : ADEME
- **Saison** : 4
- **Niveau** : Debutant / Intermediaire / Avance
- **Problematique** : Face a l'opacite du secteur de l'IA generative sur son impact environnemental, comment mobiliser les donnees existantes pour eclairer le debat public ?
- **Referent** : Lydie Bousseau (ADEME) - lydie.bousseau@ademe.fr

### Realisations possibles

**Debutant :**
- Infographie pedagogique sur la materialite de l'IA
- Datavisualisation comparative de la conso energetique des modeles (Compar:IA, AI Energy Score)
- Article vulgarise deconstruisant une idee recue

**Intermediaire :**
- Analyse comparative transparence modeles (Foundation Model Transparency Index + conso energetique)
- Etude variabilite conso selon types de requetes
- Cartographie interactive data centers en France (OpenStreetMap + ODRE)
- Article data journalisme (engagements vs emissions reelles Google/Microsoft)
- Outil de sensibilisation estimation impact usage IA

**Avance :**
- Methodologie benchmark efficacite energetique modeles open source
- Outil interactif avance estimation impact (multi-parametres)
- Etude prospective conflits d'usage electricite (data centers vs transport/industrie)
- Application scoring "frugalite" d'un modele IA

### Datasets
- Consommation electrique par IRIS (Open Data Reseaux Energies)
- Localisation data centers OpenStreetMap
- AI Energy Score (Hugging Face, Salesforce, etc.)
- Donnees Compar:IA (conversations 1.5Go, votes 447Mo, reactions 431Mo)
- Foundation Model Transparency Index (Stanford)

---

## 2. IA culturelles

- **Partenaire** : Ministere de la Culture
- **Saison** : 4
- **Niveau** : Debutant / Intermediaire / Avance
- **Problematique** : Comment mobiliser les IA culturelles (via compar:IA) pour comprendre usages, biais, performances des modeles en francais et sur contenus culturels ?
- **Referents** : Eudes Peyre (DPNC), Lucie Termignon (compar:IA)

### Realisations possibles

**Debutant :**
- Analyse descriptive usage compar:IA (categories, modeles, langues)
- Exploration et categorisation des prompts

**Intermediaire :**
- Analyse relation performance / consommation energetique
- Datavisualisation comparaison comportements IA
- Etude comparative reponses IA a prompts culturels
- Croisement reponses IA avec donnees culturelles ouvertes (monuments, musees, festivals)

**Avance :**
- Detecteur de biais entre modeles (LLM fine-tune)
- Modelisation "creativite" d'un modele sur contenus culturels
- Analyse style conversationnel (empreintes stylistiques)
- Comparatif modeles centre sur donnees culturelles
- Outils interactifs IA x donnees ouvertes x diversite culturelle

### Datasets
- Donnees Compar:IA (conversations, votes, reactions)
- Base BASILIC (lieux culturels)
- Base Joconde (collections musees)
- Films +1M entrees (CNC)
- Frequentation musees de France
- culture.data.gouv.fr
- Base AGORHA (INHA)
- Base PALISSY (patrimoine mobilier)

---

## 3. Prevention des risques a Bordeaux Metropole

- **Partenaire** : Bordeaux Metropole
- **Saison** : 4
- **Niveau** : Non specifie (tous niveaux implicite)
- **Problematique** : Comment mobiliser l'analyse et la visualisation de donnees pour aider les habitants de Bordeaux Metropole a prendre conscience des risques naturels, technologiques et industriels ?

### Realisations possibles
- Datavisualisation interactive risques sur territoire
- Tableau de bord multi-aleas (metropole, commune, quartier)
- Service avec parcours personnalise (localisation, habitat, trajets)
- Application lieux refuge (ilots fraicheur en canicule)
- Infographie risques actuels + anticipation evolution
- Article data journalisme (ex: incendies 2022)
- Cartographie equipements au croisement de risques (sante en zones inondables)

### Datasets (tres riche : ~30 jeux)
- BDIFF (incendies forets)
- Zones Climatiques Locales (Cerema)
- Donnees climatologiques mensuelles (Meteo-France)
- Ilots chaleur/fraicheur Bordeaux
- Vigicrues, zonages inondation
- ICPE, canalisations dangereuses
- Equipements publics Bordeaux
- PPRI, PPRT
- Populations INSEE, revenus, pauvrete
- Retrait-gonflement argiles, mouvements terrain

---

## 4. Sante et territoires

- **Partenaire** : Fondation Roche
- **Saison** : 4
- **Niveau** : Non specifie (tous niveaux)
- **Problematique** : Comment aider les acteurs locaux a realiser un diagnostic de sante publique sur leur territoire ?
- **Environnement** : SSP Cloud de l'INSEE disponible

### Realisations possibles
- Tableau de bord offre de soin + evolution
- Cartographie populations vulnerables (determinants sociaux)
- Analyse facteurs influencant mortalite
- Outil pour citoyens/medecins decouverte offre soin
- Analyses econometriques (regressions, mortalite vs acces soins)
- Focus suggere : CC Thierache du Centre, CA Maubeuge, Metropole Lille

### Datasets (~24 jeux)
- APL (Accessibilite Potentielle Localisee)
- FINESS, RPPS (etablissements, professionnels)
- Cartosante, Geodes, Sirse
- Causes medicales deces (CepiDC-INSERM)
- Populations, revenus, pauvrete (INSEE)
- Pathologies par territoire (Assurance Maladie)
- Indice defavorisation sociale (FDep)

---

## 5. Tourisme en train

- **Partenaire** : Fondation SNCF
- **Saison** : 4
- **Niveau** : Non specifie
- **Problematique** : Comment faciliter et encourager le tourisme en train en France ?

### Realisations possibles
- Cartographie parcours cyclables / mobilites locales depuis gares
- Cartographie / tableau de bord POI touristiques pres des gares
- Application decouverte destinations (isochrones, frequence trains, POI)
- Calcul empreinte carbone train vs voiture vs avion
- ATTENTION : calculateur d'itineraire complet = trop complexe

### Datasets (~17 jeux)
- API SNCF (isochrones, calculateur)
- DATAtourisme (POI)
- Gares de voyageurs, horaires SNCF
- Disponibilite MAX JEUNE / MAX SENIOR
- BASILIC (lieux culturels)
- Amenagements cyclables (Geovelo)
- transport.data.gouv.fr
- Festivals, EPV, Qualite Tourisme
- OpenStreetMap

---

## 6. Les Francaises et Francais face a l'information

- **Partenaire** : Aucun partenaire specifique ("propose dans le cadre de l'Open Data University")
- **Saison** : 4
- **Niveau** : Intermediaire
- **Problematique** : Evolution des themes TV/radio, representation femmes, evolution du rapport a l'information

### ⚠️ NOTE IMPORTANTE
Ce defi est le seul "propose dans le cadre de l'Open Data University" sans partenaire externe specifique. Les autres mentionnent un partenaire (ADEME, Ministere Culture, Bordeaux Metropole, Fondation Roche, Fondation SNCF, Enedis). **C'est potentiellement celui qui n'est pas eligible au prix.**

### Realisations possibles
- Tableau de bord evolution themes JT (ex: faits divers France 2 vs TF1)
- Data science : proximite JT par themes (KNN, Random Forest)
- Datavisualisations temps de parole femmes/hommes
- Article sur rapport des francais a l'information (sondages)
- Bonus : analyse temps de parole genree par sujet (inaSpeechSegmenter)

### Datasets (~11 jeux)
- Classement thematique sujets JT (INA, 2000-2020)
- Audience TV (CNC)
- Barometre "Les Francais et l'information" (ARCOM)
- Temps de parole femmes/hommes (INA/CSA)
- Films a la TV, financement TV
- VOD, TV de rattrapage

---

## 7. Changement climatique

- **Partenaire** : Aucun partenaire externe (developpe dans le cadre de l'Open Data University)
- **Saison** : 4
- **Niveau** : Confirme
- **Problematique** : Analyser le climat passe et projections futures a l'echelle France/region/commune
- **Environnement** : SSP Cloud de l'INSEE disponible

### Realisations possibles
- Data analyse climat France 1900-aujourd'hui
- Cartographie evolution temperature (decoupe regional/communal)
- Data science : predictions evolution temperature 2100 (differents scenarios GES)

### Datasets (~14 jeux)
- Donnees climatologiques Meteo-France (6min, horaires, quotidiennes, mensuelles, decadaires)
- Projections climatiques DRIAS
- Longues Series Homogeneisees (LSH)
- Modele SIM (Safran-Isba)
- Series Quotidiennes de Reference (SQR)
- Inventaire national GES

---

## 8. Diagnostics de Performance Energetique (DPE)

- **Partenaire** : Enedis
- **Saison** : 4
- **Niveau** : Confirme
- **Problematique** : Evaluer l'impact de la classe DPE sur les consommations electriques reelles et confronter estimations DPE aux mesures
- **Environnement** : SSP Cloud de l'INSEE disponible

### Realisations possibles
- Data analyse : conso reelle (kWh/m2/an) vs estimations DPE
- Datavisualisation : lien conso estimee vs mesuree, variabilite
- Data analyse : impact classes DPE (A-G) sur conso reelle, gain par amelioration de classe
- Data science : prediction conso electrique foyers (DPE + adresse + demo)
- Outil prediction economies post-renovation + donnees meteo

### Difficulte technique principale
Croiser les bases DPE et consommations Enedis (normalisation adresses via API BAN)

### Datasets (~8 jeux)
- Base Adresse Nationale (BAN)
- BDNB (Base donnees nationale batiments)
- Conso electrique par adresse (Enedis, 400K adresses, 2018-2022)
- DPE Logements existants depuis 2021 (ADEME, 6M logements)
- DPE avant 2021 (attention: energies non separees)
- DPE neufs, tertiaire

---

## Tableau comparatif

| # | Defi | Partenaire | Niveau | Eligible prix? | Nb datasets |
|---|------|-----------|--------|---------------|-------------|
| 1 | Impact IA | ADEME | Tous | OUI | ~5 |
| 2 | IA culturelles | Min. Culture | Tous | OUI | ~8 |
| 3 | Risques Bordeaux | Bordeaux Metropole | Tous | OUI | ~30 |
| 4 | Sante territoires | Fondation Roche | Tous | OUI | ~24 |
| 5 | Tourisme train | Fondation SNCF | Tous | OUI | ~17 |
| 6 | Info/audiovisuel | **Aucun** | Intermediaire | **A VERIFIER** | ~11 |
| 7 | Changement climatique | **Aucun** | Confirme | **A VERIFIER** | ~14 |
| 8 | DPE | Enedis | Confirme | OUI | ~8 |

**Note** : Les defis 6 et 7 sont "proposes dans le cadre de l'Open Data University" sans partenaire externe. Le defi 6 semble le plus probable candidat pour ne pas etre eligible au prix Demo Day.
