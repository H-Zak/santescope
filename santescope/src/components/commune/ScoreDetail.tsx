"use client";

import { useState } from "react";
import { CommuneData } from "@/lib/types";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const INDICATOR_HELP: Record<string, string> = {
  "Accès aux soins (APL)": "Accessibilité Potentielle Localisée : nombre de consultations accessibles par habitant par an, tenant compte de l'offre et de la demande locales.",
  "Taux de pauvreté": "Part de la population vivant sous le seuil de pauvreté (60% du revenu médian national). Source : INSEE FiLoSoFi.",
  "Personnes 75+ isolées": "Part de la population de 75 ans et plus dans la commune. Source : INSEE RP2020.",
  "Temps d'accès urgences": "Temps de trajet en minutes vers le service d'urgences le plus proche, pas le temps d'attente sur place. 0 min = urgences présentes dans la commune.",
};

function InfoTooltip({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger
        style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 15, height: 15, borderRadius: "50%",
          background: "#f1f5f9", color: "#94a3b8",
          fontSize: 9, fontWeight: 700, cursor: "help",
          border: "none", padding: 0, marginLeft: 4, flexShrink: 0,
          fontFamily: "inherit",
        }}
      >
        ?
      </TooltipTrigger>
      <TooltipContent side="top" style={{ maxWidth: 260 }}>
        {text}
      </TooltipContent>
    </Tooltip>
  );
}

interface ScoreDetailProps {
  scoreDetail: CommuneData["score_detail"];
  aplEvolution?: Record<string, number>;
  communeName?: string;
}

const APL_YEARS = ["2015", "2016", "2017", "2018", "2019", "2021", "2022", "2023"];

function AplEvolutionPanel({ evo, communeName, national }: { evo: Record<string, number>; communeName: string; national: number }) {
  const validYears = APL_YEARS.filter((y) => evo[y] != null);
  if (validYears.length < 2) return null;

  const values = validYears.map((y) => evo[y]);
  const min = Math.min(...values, national) - 0.2;
  const max = Math.max(...values, national) + 0.2;
  const range = max - min || 1;

  const W = 300;
  const H = 80;
  const PAD_X = 8;
  const PAD_Y = 10;

  const points = validYears.map((y, i) => {
    const x = PAD_X + (i / (validYears.length - 1)) * (W - 2 * PAD_X);
    const yVal = PAD_Y + (1 - (evo[y] - min) / range) * (H - 2 * PAD_Y);
    return [x, yVal] as [number, number];
  });

  const natY = PAD_Y + (1 - (national - min) / range) * (H - 2 * PAD_Y);
  const toPath = (pts: [number, number][]) =>
    pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");

  const first = values[0];
  const last = values[values.length - 1];
  const delta = last - first;

  return (
    <div style={{ padding: "12px 14px", background: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#475569", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>
        Évolution APL ({validYears[0]} → {validYears[validYears.length - 1]})
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
        {/* Grid */}
        {[0.25, 0.5, 0.75].map((pct) => (
          <line key={pct} x1={PAD_X} x2={W - PAD_X} y1={PAD_Y + pct * (H - 2 * PAD_Y)} y2={PAD_Y + pct * (H - 2 * PAD_Y)} stroke="#e2e8f0" strokeWidth="0.5" />
        ))}
        {/* National average line */}
        <line x1={PAD_X} x2={W - PAD_X} y1={natY} y2={natY} stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 3" />
        <text x={W - PAD_X - 2} y={natY - 4} textAnchor="end" fontSize="7" fill="#94a3b8">moy. nat. ({national.toFixed(1)})</text>
        {/* Year labels */}
        {[validYears[0], validYears[Math.floor(validYears.length / 2)], validYears[validYears.length - 1]].map((y) => {
          const idx = validYears.indexOf(y);
          const x = PAD_X + (idx / (validYears.length - 1)) * (W - 2 * PAD_X);
          return <text key={y} x={x} y={H - 1} textAnchor="middle" fontSize="7" fill="#94a3b8">{y}</text>;
        })}
        {/* Commune line */}
        <path d={toPath(points)} fill="none" stroke="#0F766E" strokeWidth="2" strokeLinecap="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r="2.5" fill="#0F766E" />
        ))}
      </svg>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6, fontSize: 10 }}>
        <div style={{ width: 12, height: 2, background: "#0F766E", borderRadius: 1 }} />
        <span style={{ color: "#0F766E", fontWeight: 600 }}>{communeName}</span>
        <span style={{ color: delta >= 0 ? "#16a34a" : "#DC2626", fontWeight: 600 }}>
          ({delta >= 0 ? "+" : ""}{delta.toFixed(2)})
        </span>
        <span style={{ marginLeft: "auto", color: "#94a3b8" }}>--- moy. nationale</span>
      </div>
    </div>
  );
}

export function ScoreDetail({ scoreDetail, aplEvolution, communeName }: ScoreDetailProps) {
  const [aplOpen, setAplOpen] = useState(false);
  const hasEvolution = aplEvolution && Object.keys(aplEvolution).length >= 2;

  interface Row {
    label: string;
    value: string;
    national: string;
    higherIsBetter: boolean;
    unavailable?: boolean;
  }

  const rows: Row[] = [
    {
      label: "Accès aux soins (APL)",
      value: scoreDetail.apl != null ? scoreDetail.apl.toFixed(1) : "Non disponible",
      national: scoreDetail.apl_national.toFixed(1),
      higherIsBetter: true,
      unavailable: scoreDetail.apl == null,
    },
    {
      label: "Taux de pauvreté",
      value:
        scoreDetail.pauvrete !== null
          ? (scoreDetail.pauvrete * 100).toFixed(1) + "%"
          : "Non disponible",
      national: (scoreDetail.pauvrete_national * 100).toFixed(1) + "%",
      higherIsBetter: false,
      unavailable: scoreDetail.pauvrete === null,
    },
    {
      label: "Personnes 75+ isolées",
      value: (scoreDetail.pct_75_seuls * 100).toFixed(1) + "%",
      national: (scoreDetail.pct_75_seuls_national * 100).toFixed(1) + "%",
      higherIsBetter: false,
    },
    {
      label: "Temps d'accès urgences",
      value: scoreDetail.temps_urgences_min != null ? scoreDetail.temps_urgences_min.toFixed(0) + " min" : "Non disponible",
      national: scoreDetail.temps_urgences_national.toFixed(0) + " min",
      higherIsBetter: false,
      unavailable: scoreDetail.temps_urgences_min == null,
    },
  ];

  function getBetter(row: Row): boolean | null {
    if (row.unavailable) return null;
    const val = parseFloat(row.value);
    const nat = parseFloat(row.national);
    if (isNaN(val) || isNaN(nat)) return null;
    return row.higherIsBetter ? val > nat : val < nat;
  }

  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden" }}>
      {rows.map((row, i) => {
        const better = getBetter(row);
        const isApl = i === 0;
        const isLast = i === rows.length - 1;
        const clickable = isApl && hasEvolution;

        return (
          <div key={row.label}>
            <div
              onClick={clickable ? () => setAplOpen((v) => !v) : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "10px 14px",
                borderBottom: (isLast && !(isApl && aplOpen)) ? "none" : "1px solid #f1f5f9",
                cursor: clickable ? "pointer" : "default",
                transition: "background 0.1s",
                opacity: row.unavailable ? 0.5 : 1,
              }}
              onMouseEnter={clickable ? (e) => { e.currentTarget.style.background = "#f8fafc"; } : undefined}
              onMouseLeave={clickable ? (e) => { e.currentTarget.style.background = "transparent"; } : undefined}
            >
              {/* Chevron or spacer */}
              {clickable ? (
                <svg
                  width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"
                  style={{ flexShrink: 0, marginRight: 8, transition: "transform 0.15s", transform: aplOpen ? "rotate(90deg)" : "rotate(0deg)" }}
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              ) : (
                <div style={{ width: 14, marginRight: 8 }} />
              )}

              <span style={{ flex: 1, fontSize: 13, color: "#64748b", display: "flex", alignItems: "center" }}>
                {row.label}
                {INDICATOR_HELP[row.label] && <InfoTooltip text={INDICATOR_HELP[row.label]} />}
              </span>
              <span style={{ fontSize: 15, fontWeight: 600, color: "#1e293b", marginRight: 8 }}>{row.value}</span>
              <div
                style={{
                  flexShrink: 0, textAlign: "center", borderRadius: 6, padding: "3px 8px",
                  fontSize: 10, lineHeight: 1.3,
                  background: better === null ? "#f1f5f9" : better ? "#f0fdf4" : "#fef2f2",
                  color: better === null ? "#94a3b8" : better ? "#16a34a" : "#DC2626",
                }}
              >
                {better === null ? (
                  <span>—</span>
                ) : (
                  <>
                    <div>{better ? "▲" : "▼"} moy. nat.</div>
                    <div style={{ fontWeight: 600 }}>({row.national})</div>
                  </>
                )}
              </div>
            </div>

            {/* Expandable APL panel */}
            {isApl && aplOpen && aplEvolution && communeName && (
              <AplEvolutionPanel evo={aplEvolution} communeName={communeName} national={scoreDetail.apl_national} />
            )}
          </div>
        );
      })}
    </div>
  );
}
