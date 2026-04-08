import { CommuneData } from "@/lib/types";

type Twin = CommuneData["jumelles"][number];

interface TwinPanelProps {
  twin: Twin;
  communeApl?: number;
}

export function TwinPanel({ twin, communeApl }: TwinPanelProps) {
  const aplImproved = twin.apl_apres > twin.apl_avant;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-lg font-bold text-slate-800">{twin.nom}</span>
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-700">
          {Math.round(twin.similarite * 100)}% similaire
        </span>
        {twin.has_msp && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
            MSP installée
          </span>
        )}
      </div>

      {/* Actions réalisées — green card style */}
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
              display: "inline-flex",
              width: 16,
              height: 16,
              borderRadius: "50%",
              background: "#22C55E",
              alignItems: "center",
              justifyContent: "center",
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
              <span
                style={{
                  background: "#dcfce7",
                  padding: "2px 8px",
                  borderRadius: 4,
                  fontSize: 11,
                  fontWeight: 500,
                  color: "#166534",
                }}
              >
                {action}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Évolution APL */}
      <div>
        <p
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: "#64748b",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            marginBottom: 8,
          }}
        >
          Évolution APL
        </p>
        <div className="flex items-center gap-3">
          <div className="text-center">
            <p style={{ fontSize: 11, color: "#64748b" }}>Avant</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: "#64748b" }}>{twin.apl_avant}</p>
          </div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={aplImproved ? "#22C55E" : "#EF4444"} strokeWidth="2.5" strokeLinecap="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
          <div className="text-center">
            <p style={{ fontSize: 11, color: "#64748b" }}>Après</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: aplImproved ? "#16a34a" : "#EF4444" }}>
              {twin.apl_apres}
            </p>
          </div>
        </div>
        {communeApl !== undefined && twin.apl_apres > communeApl && (
          <p style={{ fontSize: 11, color: "#16a34a", marginTop: 6 }}>
            Cette commune a amélioré son APL au-delà du vôtre ({communeApl.toFixed(1)}) — ses actions sont reproductibles
          </p>
        )}
      </div>
    </div>
  );
}
