"use client";

import { useCommuneData } from "@/hooks/useCommuneData";
import { ScoreBadge } from "@/components/commune/ScoreBadge";
import { DpeStrip } from "@/components/commune/DpeStrip";
import { ScoreGauge } from "@/components/commune/ScoreGauge";
import { ScoreDetail } from "@/components/commune/ScoreDetail";
import { DominoAlert } from "@/components/commune/DominoAlert";
import { CommuneData } from "@/lib/types";

type TwinRef = CommuneData["jumelles"][number];

interface TwinPanelProps {
  twin: TwinRef;
}

function SkeletonCard({ className = "" }: { className?: string }) {
  return <div className={`bg-slate-100 rounded-lg animate-pulse ${className}`} />;
}

export function TwinPanel({ twin }: TwinPanelProps) {
  const { data, loading } = useCommuneData(twin.code);
  const aplImproved = twin.apl_apres > twin.apl_avant;

  return (
    <div className="flex flex-col gap-3">
      {/* Header: nom + badges */}
      <div className="flex items-center gap-3 flex-wrap">
        {data ? (
          <ScoreBadge classe={data.classe} size={44} />
        ) : (
          <ScoreBadge classe={null} size={44} />
        )}
        <div className="flex-1 min-w-0">
          <span className="text-lg font-bold text-slate-800">{twin.nom}</span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-700">
              {Math.round(twin.similarite * 100)}% similaire
            </span>
            {twin.has_msp && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                MSP installée
              </span>
            )}
          </div>
        </div>
        {data && <DpeStrip active={data.classe} small />}
      </div>

      {/* Score gauge - loaded from full data */}
      {loading ? (
        <SkeletonCard className="h-8" />
      ) : data ? (
        <ScoreGauge classe={data.classe} score={data.score} />
      ) : null}

      {/* Actions réalisées — the unique value of twins */}
      <div
        style={{
          background: "#f0fdf4",
          borderLeft: "3px solid #22C55E",
          borderRadius: 8,
          padding: "12px 14px",
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "#16a34a",
            marginBottom: 6,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span
            style={{
              display: "inline-flex", width: 16, height: 16, borderRadius: "50%",
              background: "#22C55E", alignItems: "center", justifyContent: "center",
            }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
          Actions réalisées
        </div>
        {twin.actions.length === 0 ? (
          <p style={{ fontSize: 12, color: "#94a3b8" }}>Aucune action identifiée</p>
        ) : (
          twin.actions.map((action, i) => (
            <div key={i} style={{ marginBottom: 4 }}>
              <span style={{
                background: "#dcfce7", padding: "2px 8px", borderRadius: 4,
                fontSize: 11, fontWeight: 500, color: "#166534",
              }}>
                {action}
              </span>
            </div>
          ))
        )}
        {/* APL evolution */}
        <div className="flex items-center gap-3 mt-2">
          <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Évolution APL
          </span>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#64748b" }}>{twin.apl_avant}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={aplImproved ? "#22C55E" : "#EF4444"} strokeWidth="2.5" strokeLinecap="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
          <span style={{ fontSize: 16, fontWeight: 700, color: aplImproved ? "#16a34a" : "#EF4444" }}>
            {twin.apl_apres}
          </span>
        </div>
      </div>

      {/* Full diagnostic — same indicators as left panel */}
      {loading ? (
        <>
          <SkeletonCard className="h-20" />
          <SkeletonCard className="h-16" />
        </>
      ) : data ? (
        <>
          <ScoreDetail scoreDetail={data.score_detail} />
          {data.domino && (
            <DominoAlert domino={data.domino} medecinTotal={data.medecins.total} />
          )}
        </>
      ) : null}
    </div>
  );
}
