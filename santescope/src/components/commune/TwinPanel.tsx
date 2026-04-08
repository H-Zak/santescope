"use client";

import { useCommuneData } from "@/hooks/useCommuneData";
import { ScoreBadge } from "@/components/commune/ScoreBadge";
import { ScoreGauge } from "@/components/commune/ScoreGauge";
import { CommuneData } from "@/lib/types";

type TwinRef = CommuneData["jumelles"][number];

interface TwinPanelProps {
  twin: TwinRef;
  commune: CommuneData;
}

function SkeletonCard({ className = "" }: { className?: string }) {
  return <div className={`bg-slate-100 rounded-lg animate-pulse ${className}`} />;
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
      <span style={{ color: "#cbd5e1", margin: "0 6px" }}>→</span>
      <span style={{
        fontWeight: 600, width: 55, textAlign: "right",
        color: twinBetter === null ? "#64748b" : twinBetter ? "#16a34a" : "#DC2626",
      }}>
        {twinValue}
      </span>
    </div>
  );
}

export function TwinPanel({ twin, commune }: TwinPanelProps) {
  const { data: twinData, loading } = useCommuneData(twin.code);

  const myAplEvo = commune.apl_evolution;
  const myApl22 = myAplEvo?.["2022"];
  const myApl23 = myAplEvo?.["2023"];
  const myDelta = myApl22 != null && myApl23 != null ? myApl23 - myApl22 : null;

  const twinApl22 = twin.apl_avant;
  const twinApl23 = twin.apl_apres;
  const twinDelta = twinApl22 != null && twinApl23 != null ? twinApl23 - twinApl22 : null;

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        {twinData ? (
          <ScoreBadge classe={twinData.classe} size={40} />
        ) : (
          <ScoreBadge classe={null} size={40} />
        )}
        <div className="flex-1 min-w-0">
          <span className="text-base font-bold text-slate-800">{twin.nom}</span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-100 text-sky-700">
              {Math.round(twin.similarite * 100)}% similaire
            </span>
          </div>
        </div>
      </div>

      {/* Score gauge */}
      {loading ? (
        <SkeletonCard className="h-6" />
      ) : twinData ? (
        <ScoreGauge classe={twinData.classe} score={twinData.score} />
      ) : null}

      {/* Actions réalisées */}
      {twin.actions.length > 0 && (
        <div style={{
          background: "#f0fdf4", borderLeft: "3px solid #22C55E",
          borderRadius: 8, padding: "10px 12px",
        }}>
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
              <span style={{
                background: "#dcfce7", padding: "2px 8px", borderRadius: 4,
                fontSize: 11, fontWeight: 500, color: "#166534",
              }}>
                {action}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Évolution APL côte à côte */}
      <div style={{
        background: "#f8fafc", border: "1px solid #e2e8f0",
        borderRadius: 8, padding: "10px 12px",
      }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#475569", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          Évolution APL (2022 → 2023)
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {/* Ma commune */}
          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 4 }}>{commune.nom}</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: "#64748b" }}>{myApl22 ?? "–"}</span>
              <span style={{ color: "#cbd5e1" }}>→</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: myDelta !== null && myDelta > 0 ? "#16a34a" : myDelta !== null && myDelta < 0 ? "#DC2626" : "#64748b" }}>
                {myApl23 ?? "–"}
              </span>
            </div>
            {myDelta !== null && (
              <div style={{ fontSize: 10, fontWeight: 600, color: myDelta > 0 ? "#16a34a" : myDelta < 0 ? "#DC2626" : "#64748b", marginTop: 2 }}>
                {myDelta > 0 ? "+" : ""}{myDelta.toFixed(1)}
              </div>
            )}
          </div>
          {/* Séparateur */}
          <div style={{ width: 1, background: "#e2e8f0" }} />
          {/* Jumelle */}
          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 4 }}>{twin.nom}</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: "#64748b" }}>{twinApl22 ?? "–"}</span>
              <span style={{ color: "#cbd5e1" }}>→</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: twinDelta !== null && twinDelta > 0 ? "#16a34a" : twinDelta !== null && twinDelta < 0 ? "#DC2626" : "#64748b" }}>
                {twinApl23 ?? "–"}
              </span>
            </div>
            {twinDelta !== null && (
              <div style={{ fontSize: 10, fontWeight: 600, color: twinDelta > 0 ? "#16a34a" : twinDelta < 0 ? "#DC2626" : "#64748b", marginTop: 2 }}>
                {twinDelta > 0 ? "+" : ""}{twinDelta.toFixed(1)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Indicateurs comparés côte à côte */}
      {loading ? (
        <SkeletonCard className="h-24" />
      ) : twinData ? (
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#475569", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Indicateurs comparés
          </div>
          <div style={{ fontSize: 10, color: "#94a3b8", display: "flex", marginBottom: 2 }}>
            <span style={{ flex: 1 }} />
            <span style={{ width: 55, textAlign: "right" }}>Vous</span>
            <span style={{ width: 18 }} />
            <span style={{ width: 55, textAlign: "right" }}>Jumelle</span>
          </div>
          <CompareRow
            label="APL"
            myValue={commune.score_detail.apl.toFixed(1)}
            twinValue={twinData.score_detail.apl.toFixed(1)}
            lowerIsBetter={false}
          />
          <CompareRow
            label="Pauvreté"
            myValue={commune.score_detail.pauvrete !== null ? (commune.score_detail.pauvrete * 100).toFixed(1) + "%" : "N/D"}
            twinValue={twinData.score_detail.pauvrete !== null ? (twinData.score_detail.pauvrete * 100).toFixed(1) + "%" : "N/D"}
            lowerIsBetter={true}
          />
          <CompareRow
            label="75+ isolées"
            myValue={(commune.score_detail.pct_75_seuls * 100).toFixed(1) + "%"}
            twinValue={(twinData.score_detail.pct_75_seuls * 100).toFixed(1) + "%"}
            lowerIsBetter={true}
          />
          <CompareRow
            label="Urgences"
            myValue={commune.score_detail.temps_urgences_min.toFixed(0) + " min"}
            twinValue={twinData.score_detail.temps_urgences_min.toFixed(0) + " min"}
            lowerIsBetter={true}
          />
        </div>
      ) : null}

      {/* Domino de la jumelle */}
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
