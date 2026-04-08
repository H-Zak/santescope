"use client";

import { useState } from "react";
import { useCommuneData } from "@/hooks/useCommuneData";
import { ScoreBadge } from "@/components/commune/ScoreBadge";
import { ScoreGauge } from "@/components/commune/ScoreGauge";
import { MiniMap } from "@/components/commune/MiniMap";
import { CommuneData } from "@/lib/types";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const INDICATOR_HELP: Record<string, string> = {
  "APL": "Accessibilité Potentielle Localisée : consultations accessibles par habitant par an.",
  "Pauvreté": "Part de la population sous le seuil de pauvreté. Source : INSEE FiLoSoFi.",
  "75+ isolées": "Part de la population de 75 ans et plus. Source : INSEE RP2020.",
  "Urgences": "Temps de trajet vers les urgences les plus proches (pas le temps d'attente). 0 min = urgences sur place.",
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
      <TooltipContent side="top" style={{ maxWidth: 240 }}>
        {text}
      </TooltipContent>
    </Tooltip>
  );
}

type TwinRef = CommuneData["jumelles"][number];

interface TwinPanelProps {
  twin: TwinRef;
  commune: CommuneData;
}

function SkeletonCard({ className = "" }: { className?: string }) {
  return <div className={`bg-slate-100 rounded-lg animate-pulse ${className}`} />;
}

const APL_YEARS = ["2015", "2016", "2017", "2018", "2019", "2021", "2022", "2023"];

function AplSparkline({
  communeEvo,
  twinEvo,
  communeName,
  twinName,
}: {
  communeEvo: Record<string, number>;
  twinEvo: Record<string, number>;
  communeName: string;
  twinName: string;
}) {
  const allValues = [
    ...APL_YEARS.map((y) => communeEvo[y]).filter((v) => v != null),
    ...APL_YEARS.map((y) => twinEvo[y]).filter((v) => v != null),
  ];
  if (allValues.length === 0) return null;

  const min = Math.min(...allValues) - 0.1;
  const max = Math.max(...allValues) + 0.1;
  const range = max - min || 1;

  const W = 260;
  const H = 80;
  const PAD_X = 5;
  const PAD_Y = 8;

  function toPoints(evo: Record<string, number>) {
    const points: [number, number][] = [];
    const validYears = APL_YEARS.filter((y) => evo[y] != null);
    validYears.forEach((y, i) => {
      const x = PAD_X + (i / Math.max(validYears.length - 1, 1)) * (W - 2 * PAD_X);
      const yVal = PAD_Y + (1 - (evo[y] - min) / range) * (H - 2 * PAD_Y);
      points.push([x, yVal]);
    });
    return points;
  }

  const communePoints = toPoints(communeEvo);
  const twinPoints = toPoints(twinEvo);

  const toPath = (pts: [number, number][]) =>
    pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");

  const communeLast = communeEvo[APL_YEARS.filter((y) => communeEvo[y] != null).slice(-1)[0]];
  const twinLast = twinEvo[APL_YEARS.filter((y) => twinEvo[y] != null).slice(-1)[0]];
  const communeFirst = communeEvo[APL_YEARS.filter((y) => communeEvo[y] != null)[0]];
  const twinFirst = twinEvo[APL_YEARS.filter((y) => twinEvo[y] != null)[0]];

  const communeDelta = communeFirst != null && communeLast != null ? communeLast - communeFirst : null;
  const twinDelta = twinFirst != null && twinLast != null ? twinLast - twinFirst : null;

  return (
    <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 12px" }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#475569", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>
        Évolution APL (2015 → 2023)
      </div>

      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map((pct) => (
          <line
            key={pct}
            x1={PAD_X} x2={W - PAD_X}
            y1={PAD_Y + pct * (H - 2 * PAD_Y)}
            y2={PAD_Y + pct * (H - 2 * PAD_Y)}
            stroke="#e2e8f0" strokeWidth="0.5"
          />
        ))}
        {/* Year labels */}
        {["2015", "2019", "2023"].map((y) => {
          const idx = APL_YEARS.indexOf(y);
          const x = PAD_X + (idx / (APL_YEARS.length - 1)) * (W - 2 * PAD_X);
          return (
            <text key={y} x={x} y={H - 1} textAnchor="middle" fontSize="7" fill="#94a3b8">
              {y}
            </text>
          );
        })}
        {/* Ma commune line */}
        {communePoints.length > 1 && (
          <path d={toPath(communePoints)} fill="none" stroke="#0F766E" strokeWidth="2" strokeLinecap="round" />
        )}
        {communePoints.map((p, i) => (
          <circle key={`c${i}`} cx={p[0]} cy={p[1]} r="2.5" fill="#0F766E" />
        ))}
        {/* Twin line */}
        {twinPoints.length > 1 && (
          <path d={toPath(twinPoints)} fill="none" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 2" />
        )}
        {twinPoints.map((p, i) => (
          <circle key={`t${i}`} cx={p[0]} cy={p[1]} r="2.5" fill="#0EA5E9" />
        ))}
      </svg>

      {/* Legend */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ width: 12, height: 2, background: "#0F766E", borderRadius: 1 }} />
          <span style={{ color: "#0F766E", fontWeight: 600 }}>{communeName}</span>
          {communeDelta !== null && (
            <span style={{ color: communeDelta >= 0 ? "#16a34a" : "#DC2626", fontWeight: 600 }}>
              ({communeDelta >= 0 ? "+" : ""}{communeDelta.toFixed(2)})
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ width: 12, height: 2, background: "#0EA5E9", borderRadius: 1, borderTop: "1px dashed #0EA5E9" }} />
          <span style={{ color: "#0EA5E9", fontWeight: 600 }}>{twinName}</span>
          {twinDelta !== null && (
            <span style={{ color: twinDelta >= 0 ? "#16a34a" : "#DC2626", fontWeight: 600 }}>
              ({twinDelta >= 0 ? "+" : ""}{twinDelta.toFixed(2)})
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function CompareRow({
  label,
  myValue,
  twinValue,
  lowerIsBetter = false,
}: {
  label: string;
  myValue: string;
  twinValue: string;
  lowerIsBetter?: boolean;
}) {
  const myNum = parseFloat(myValue);
  const twinNum = parseFloat(twinValue);
  const twinBetter = !isNaN(myNum) && !isNaN(twinNum)
    ? (lowerIsBetter ? twinNum < myNum : twinNum > myNum)
    : null;

  return (
    <div style={{ display: "flex", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #f1f5f9", fontSize: 12 }}>
      <span style={{ flex: 1, color: "#64748b" }}>{label}</span>
      <span style={{ fontWeight: 600, color: "#94a3b8", width: 55, textAlign: "right" }}>{myValue}</span>
      <span style={{ color: "#cbd5e1", margin: "0 6px" }}>vs</span>
      <span style={{
        fontWeight: 600, width: 55, textAlign: "right",
        color: twinBetter === null ? "#64748b" : twinBetter ? "#16a34a" : "#DC2626",
      }}>
        {twinValue}
      </span>
    </div>
  );
}

function ExpandableIndicators({
  commune,
  twin,
  twinData,
}: {
  commune: CommuneData;
  twin: TwinRef;
  twinData: CommuneData;
}) {
  const [aplOpen, setAplOpen] = useState(false);

  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#475569", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>
        Indicateurs comparés
      </div>
      <div style={{ fontSize: 10, color: "#94a3b8", display: "flex", marginBottom: 2 }}>
        <span style={{ flex: 1 }} />
        <span style={{ width: 55, textAlign: "right" }}>Vous</span>
        <span style={{ width: 30, textAlign: "center" }} />
        <span style={{ width: 55, textAlign: "right" }}>Jumelle</span>
      </div>
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden" }}>
        {/* APL row — clickable to expand sparkline */}
        <div
          onClick={() => setAplOpen((v) => !v)}
          style={{ display: "flex", alignItems: "center", padding: "10px 14px", borderBottom: "1px solid #f1f5f9", cursor: "pointer", transition: "background 0.1s" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#f8fafc"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
        >
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"
            style={{ flexShrink: 0, marginRight: 8, transition: "transform 0.15s", transform: aplOpen ? "rotate(90deg)" : "rotate(0deg)" }}
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
          <span style={{ flex: 1, fontSize: 13, color: "#64748b", display: "flex", alignItems: "center" }}>APL<InfoTooltip text={INDICATOR_HELP["APL"]} /></span>
          <span style={{ fontWeight: 600, fontSize: 14, marginRight: 6 }}>{commune.score_detail.apl.toFixed(1)}</span>
          <span style={{ fontSize: 11, color: "#94a3b8", marginRight: 12 }}>vs</span>
          <CompareValue myVal={commune.score_detail.apl} twinVal={twinData.score_detail.apl} lowerIsBetter={false} format={(v) => v.toFixed(1)} />
        </div>

        {/* Expandable APL sparkline panel */}
        {aplOpen && (
          <div style={{ padding: "12px 14px", background: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
            <AplSparkline
              communeEvo={commune.apl_evolution}
              twinEvo={twinData.apl_evolution}
              communeName={commune.nom}
              twinName={twin.nom}
            />
          </div>
        )}

        {/* Static rows */}
        <StaticRow
          label="Pauvreté"
          myValue={commune.score_detail.pauvrete !== null ? (commune.score_detail.pauvrete * 100).toFixed(1) + "%" : "N/D"}
          twinValue={twinData.score_detail.pauvrete !== null ? (twinData.score_detail.pauvrete * 100).toFixed(1) + "%" : "N/D"}
          lowerIsBetter
        />
        <StaticRow
          label="75+ isolées"
          myValue={(commune.score_detail.pct_75_seuls * 100).toFixed(1) + "%"}
          twinValue={(twinData.score_detail.pct_75_seuls * 100).toFixed(1) + "%"}
          lowerIsBetter
        />
        <StaticRow
          label="Urgences"
          myValue={commune.score_detail.temps_urgences_min.toFixed(0) + " min"}
          twinValue={twinData.score_detail.temps_urgences_min.toFixed(0) + " min"}
          lowerIsBetter
          last
        />
      </div>
    </div>
  );
}

function CompareValue({ myVal, twinVal, lowerIsBetter, format }: { myVal: number; twinVal: number; lowerIsBetter: boolean; format: (v: number) => string }) {
  const twinBetter = lowerIsBetter ? twinVal < myVal : twinVal > myVal;
  return (
    <span style={{ fontWeight: 600, fontSize: 14, color: twinBetter ? "#16a34a" : "#DC2626" }}>
      {format(twinVal)}
    </span>
  );
}

function StaticRow({ label, myValue, twinValue, lowerIsBetter, last = false }: { label: string; myValue: string; twinValue: string; lowerIsBetter?: boolean; last?: boolean }) {
  const myNum = parseFloat(myValue);
  const twinNum = parseFloat(twinValue);
  const twinBetter = !isNaN(myNum) && !isNaN(twinNum) ? (lowerIsBetter ? twinNum < myNum : twinNum > myNum) : null;
  const help = INDICATOR_HELP[label];

  return (
    <div style={{ display: "flex", alignItems: "center", padding: "10px 14px", borderBottom: last ? "none" : "1px solid #f1f5f9" }}>
      <div style={{ width: 14, marginRight: 8 }} />
      <span style={{ flex: 1, fontSize: 13, color: "#64748b", display: "flex", alignItems: "center" }}>{label}{help && <InfoTooltip text={help} />}</span>
      <span style={{ fontWeight: 600, fontSize: 14, marginRight: 6 }}>{myValue}</span>
      <span style={{ fontSize: 11, color: "#94a3b8", marginRight: 12 }}>vs</span>
      <span style={{
        fontWeight: 600, fontSize: 14,
        color: twinBetter === null ? "#64748b" : twinBetter ? "#16a34a" : "#DC2626",
      }}>
        {twinValue}
      </span>
    </div>
  );
}

export function TwinPanel({ twin, commune }: TwinPanelProps) {
  const { data: twinData, loading } = useCommuneData(twin.code);

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        {twinData ? <ScoreBadge classe={twinData.classe} size={40} /> : <ScoreBadge classe={null} size={40} />}
        <div className="flex-1 min-w-0">
          <span className="text-base font-bold text-slate-800">{twin.nom}</span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-100 text-sky-700">
              {Math.round(twin.similarite * 100)}% similaire
            </span>
          </div>
        </div>
      </div>

      {/* Score */}
      {loading ? <SkeletonCard className="h-6" /> : twinData ? <ScoreGauge classe={twinData.classe} score={twinData.score} /> : null}

      {/* Mini-map */}
      {twinData?.coords && <MiniMap nom={twin.nom} coords={twinData.coords} />}

      {/* Actions */}
      {twin.actions.length > 0 && (
        <div style={{ background: "#f0fdf4", borderLeft: "3px solid #22C55E", borderRadius: 8, padding: "10px 12px" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#16a34a", marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{
              display: "inline-flex", width: 14, height: 14, borderRadius: "50%",
              background: "#22C55E", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            Actions réalisées par cette commune
          </div>
          {twin.actions.map((action, i) => (
            <div key={i} style={{ marginBottom: 3 }}>
              <span style={{ background: "#dcfce7", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 500, color: "#166534" }}>
                {action}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Indicateurs comparés — expandable card pattern */}
      {loading ? (
        <SkeletonCard className="h-24" />
      ) : twinData ? (
        <ExpandableIndicators commune={commune} twin={twin} twinData={twinData} />
      ) : null}

      {/* Résumé médecins jumelle */}
      {twinData?.domino && (
        <div style={{
          fontSize: 11, color: "#64748b", lineHeight: 1.5,
          background: "#fefce8", border: "1px solid #fef08a",
          borderRadius: 6, padding: "8px 10px",
        }}>
          <strong>{twinData.medecins.total}</strong> médecins actifs —{" "}
          {Math.round(twinData.domino.pct_55_plus * 100)}% ont 55+ ans
          {twinData.domino.trend_cagr !== undefined && (
            <span style={{ color: twinData.domino.trend_cagr > 0 ? "#16a34a" : "#DC2626" }}>
              {" "}({twinData.domino.trend_cagr > 0 ? "+" : ""}{twinData.domino.trend_cagr}%/an dept.)
            </span>
          )}
        </div>
      )}
    </div>
  );
}
