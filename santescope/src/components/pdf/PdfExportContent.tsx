"use client";

import { CommuneData } from "@/lib/types";
import { DPE_COLORS, DPE_TEXT_COLORS, DPE_LABELS } from "@/lib/constants";
import { toHealthScore } from "@/lib/score";

interface PdfExportContentProps {
  commune: CommuneData;
}

function getComponentClass(
  value: number | null,
  national: number,
  lowerIsBetter = false
): "A" | "B" | "C" | "D" | "E" {
  if (value === null) return "C";
  const isBetter = lowerIsBetter ? value < national : value > national;
  if (isBetter) {
    const delta = lowerIsBetter
      ? (national - value) / national
      : (value - national) / national;
    return delta > 0.1 ? "A" : "B";
  } else {
    const delta = lowerIsBetter
      ? (value - national) / national
      : (national - value) / national;
    return delta > 0.1 ? "E" : "D";
  }
}

function getBarWidth(classe: string): string {
  const widths: Record<string, string> = {
    A: "90%",
    B: "75%",
    C: "55%",
    D: "42%",
    E: "28%",
  };
  return widths[classe] ?? "55%";
}

export function PdfExportContent({ commune }: PdfExportContentProps) {
  const { score_detail: sd, classe, score, nom, dept, jumelles, domino, manques } = commune;

  const today = new Date().toLocaleDateString("fr-FR");

  // Auto-generate résumé exécutif
  const classeLabel = classe ? DPE_LABELS[classe] : "indéterminée";
  const resumeLine1 = `${nom} présente une situation ${classeLabel.toLowerCase()} en matière de santé.`;

  // Worst component: find the one furthest from national
  const components = [
    { label: "Accès aux soins (APL)", value: sd.apl, national: sd.apl_national, lowerIsBetter: false },
    { label: "Taux de pauvreté", value: sd.pauvrete, national: sd.pauvrete_national, lowerIsBetter: true },
    { label: "Isolement 75+ ans", value: sd.pct_75_seuls, national: sd.pct_75_seuls_national, lowerIsBetter: true },
    { label: "Accès urgences", value: sd.temps_urgences_min, national: sd.temps_urgences_national, lowerIsBetter: true },
  ];

  const worstComponent = components.reduce((worst, c) => {
    if (c.value === null) return worst;
    const delta = c.lowerIsBetter
      ? (c.value - c.national) / Math.max(c.national, 0.001)
      : (c.national - c.value) / Math.max(c.national, 0.001);
    const worstDelta = worst.value === null
      ? -Infinity
      : worst.lowerIsBetter
        ? (worst.value - worst.national) / Math.max(worst.national, 0.001)
        : (worst.national - worst.value) / Math.max(worst.national, 0.001);
    return delta > worstDelta ? c : worst;
  }, components[0]);

  const resumeLine2 = `Vulnérabilité principale : ${worstComponent.label}.`;

  const resumeLine3 = jumelles.length > 0
    ? `Des communes similaires comme ${jumelles[0].nom} ont amélioré leur APL de ${jumelles[0].apl_avant.toFixed(1)} à ${jumelles[0].apl_apres.toFixed(1)}.`
    : "Aucune commune jumelle identifiée.";

  // Component classes for bars
  const aplClasse = getComponentClass(sd.apl, sd.apl_national, false);
  const pauvreteClasse = getComponentClass(sd.pauvrete, sd.pauvrete_national, true);
  const isolementClasse = getComponentClass(sd.pct_75_seuls, sd.pct_75_seuls_national, true);
  const urgencesClasse = getComponentClass(sd.temps_urgences_min, sd.temps_urgences_national, true);

  // Points forts (better than national)
  const pointsForts: string[] = [];
  const alertes: string[] = [];

  if (sd.apl > sd.apl_national) pointsForts.push("Bonne densité médicale (APL)");
  else alertes.push("Accès aux soins insuffisant (APL)");

  if (sd.pauvrete !== null && sd.pauvrete < sd.pauvrete_national) pointsForts.push("Taux de pauvreté inférieur à la moyenne");
  else if (sd.pauvrete !== null) alertes.push("Taux de pauvreté élevé");

  if (sd.pct_75_seuls < sd.pct_75_seuls_national) pointsForts.push("Faible isolement des personnes âgées");
  else alertes.push("Isolement des 75+ ans supérieur à la moyenne");

  if (sd.temps_urgences_min < sd.temps_urgences_national) pointsForts.push("Accès rapide aux urgences");
  else alertes.push(`Urgences éloignées (${sd.temps_urgences_min} min)`);

  if (domino && domino.pct_55_plus > 0.5) alertes.push("Alerte succession médicale critique");
  if (manques && manques.length > 0) alertes.push(`Spécialités manquantes : ${manques.slice(0, 2).join(", ")}`);

  const badgeBg = classe ? (DPE_COLORS[classe] ?? "#94a3b8") : "#94a3b8";
  const badgeTextColor = classe ? (DPE_TEXT_COLORS[classe] ?? "#fff") : "#fff";

  return (
    <div
      id="pdf-export-root"
      style={{
        position: "absolute",
        left: -9999,
        top: 0,
        visibility: "hidden",
        pointerEvents: "none",
        width: 620,
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <div
        style={{
          background: "#232323",
          border: "1px solid #333",
          borderRadius: 12,
          overflow: "hidden",
          maxWidth: 620,
          width: "100%",
          color: "#e5e5e5",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "#0F766E",
            padding: "20px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontSize: 20, fontWeight: 600, color: "#fff" }}>SanteScope</div>
            <div style={{ fontSize: 12, color: "#99f6e4", marginTop: 2 }}>
              Diagnostic territorial de santé
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, color: "#fff", fontWeight: 600 }}>
              Commune de {nom}
            </div>
            <div style={{ fontSize: 12, color: "#99f6e4" }}>
              {dept} · Généré le {today}
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 24px" }}>
          {/* Score hero */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 8,
                background: badgeBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                fontSize: 28,
                fontWeight: 600,
                color: badgeTextColor,
              }}
            >
              {classe ?? "–"}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>Score global santé</div>
              <div style={{ fontSize: 12, color: "#999", marginTop: 2 }}>
                {classe ? `${DPE_LABELS[classe]} — ${score !== null ? `${toHealthScore(score)}/10` : ""}` : "Données insuffisantes"}
              </div>
            </div>
            {/* DPE strip */}
            <div style={{ display: "flex", gap: 3, flexShrink: 0 }}>
              {["A", "B", "C", "D", "E"].map((l) => (
                <span
                  key={l}
                  style={{
                    width: 28,
                    height: 20,
                    borderRadius: 3,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    fontWeight: 600,
                    color: DPE_TEXT_COLORS[l] ?? "#fff",
                    background: DPE_COLORS[l] ?? "#ccc",
                    border: l === classe ? "2px solid #fff" : "2px solid transparent",
                  }}
                >
                  {l}
                </span>
              ))}
            </div>
          </div>

          {/* Résumé exécutif */}
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10, borderTop: "1px solid #333", paddingTop: 16 }}>
            Résumé exécutif
          </div>
          <div
            style={{
              background: "#1a1a1a",
              padding: 12,
              borderRadius: 8,
              marginBottom: 16,
              fontSize: 12,
              color: "#aaa",
              lineHeight: 1.6,
            }}
          >
            <div>{resumeLine1}</div>
            <div>{resumeLine2}</div>
            <div>{resumeLine3}</div>
          </div>

          {/* Indicateurs clés */}
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10, borderTop: "1px solid #333", paddingTop: 16 }}>
            Indicateurs clés
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 8,
              marginBottom: 16,
            }}
          >
            {/* Médecins */}
            <div style={{ background: "#1a1a1a", borderRadius: 8, padding: 10 }}>
              <div style={{ fontSize: 11, color: "#888" }}>Médecins</div>
              <div style={{ fontSize: 18, fontWeight: 600, marginTop: 2 }}>
                {commune.medecins.total}
              </div>
              <div style={{ fontSize: 10, marginTop: 1, color: commune.medecins.total > 0 ? "#22C55E" : "#EF4444" }}>
                {commune.medecins.generalistes} généralistes
              </div>
            </div>
            {/* Pauvreté */}
            <div style={{ background: "#1a1a1a", borderRadius: 8, padding: 10 }}>
              <div style={{ fontSize: 11, color: "#888" }}>Pauvreté</div>
              <div style={{ fontSize: 18, fontWeight: 600, marginTop: 2 }}>
                {sd.pauvrete !== null ? `${(sd.pauvrete * 100).toFixed(1)}%` : "N/D"}
              </div>
              <div
                style={{
                  fontSize: 10,
                  marginTop: 1,
                  color:
                    sd.pauvrete === null ? "#888"
                    : sd.pauvrete > sd.pauvrete_national ? "#EF4444"
                    : "#22C55E",
                }}
              >
                {sd.pauvrete !== null
                  ? `vs ${(sd.pauvrete_national * 100).toFixed(1)}% nat.`
                  : "Données non disponibles"}
              </div>
            </div>
            {/* Urgences */}
            <div style={{ background: "#1a1a1a", borderRadius: 8, padding: 10 }}>
              <div style={{ fontSize: 11, color: "#888" }}>Urgences</div>
              <div style={{ fontSize: 18, fontWeight: 600, marginTop: 2 }}>
                {sd.temps_urgences_min} min
              </div>
              <div
                style={{
                  fontSize: 10,
                  marginTop: 1,
                  color: sd.temps_urgences_min > sd.temps_urgences_national ? "#EF4444" : "#22C55E",
                }}
              >
                vs {sd.temps_urgences_national} min nat.
              </div>
            </div>
          </div>

          {/* Scores par dimension */}
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10, borderTop: "1px solid #333", paddingTop: 16 }}>
            Scores par dimension
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
            {[
              { label: "Accès aux soins (APL)", classe: aplClasse },
              { label: "Taux de pauvreté", classe: pauvreteClasse },
              { label: "Isolement 75+ ans", classe: isolementClasse },
              { label: "Accès urgences", classe: urgencesClasse },
            ].map(({ label, classe: c }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 130, fontSize: 11, color: "#888", flexShrink: 0 }}>{label}</div>
                <div style={{ flex: 1, background: "#1a1a1a", borderRadius: 3, height: 16, overflow: "hidden" }}>
                  <div
                    style={{
                      width: getBarWidth(c),
                      height: "100%",
                      borderRadius: 3,
                      background: DPE_COLORS[c] ?? "#ccc",
                      display: "flex",
                      alignItems: "center",
                      paddingLeft: 6,
                      fontSize: 10,
                      fontWeight: 600,
                      color: DPE_TEXT_COLORS[c] ?? "#fff",
                    }}
                  >
                    {c}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Points forts / Alertes */}
          <div
            style={{
              display: "flex",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <div
              style={{
                flex: 1,
                border: "1px solid #333",
                borderRadius: 8,
                padding: 12,
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 6, color: "#22C55E" }}>
                Points forts
              </div>
              <div style={{ fontSize: 11, color: "#999", lineHeight: 1.6 }}>
                {pointsForts.length > 0
                  ? pointsForts.map((p, i) => <div key={i}>• {p}</div>)
                  : <div style={{ color: "#666" }}>Aucun point fort identifié</div>}
              </div>
            </div>
            <div
              style={{
                flex: 1,
                border: "1px solid #333",
                borderRadius: 8,
                padding: 12,
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 6, color: "#EF4444" }}>
                Alertes
              </div>
              <div style={{ fontSize: 11, color: "#999", lineHeight: 1.6 }}>
                {alertes.length > 0
                  ? alertes.map((a, i) => <div key={i}>• {a}</div>)
                  : <div style={{ color: "#666" }}>Aucune alerte</div>}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              borderTop: "1px solid #333",
              paddingTop: 12,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 10,
              color: "#666",
            }}
          >
            <div>
              Sources : RPPS, DREES, APL, FiLoSoFi, RP2020, Urgences 2019 · SanteScope 2026
            </div>
            <div>{today}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
