import { CommuneData, IndexEntry } from "@/lib/types";
import { ScoreBadge } from "@/components/commune/ScoreBadge";

interface TwinsListProps {
  jumelles: CommuneData["jumelles"];
  activeTwinIndex: number;
  onSwap: (index: number) => void;
  index?: IndexEntry[] | null;
}

export function TwinsList({ jumelles, activeTwinIndex, onSwap, index }: TwinsListProps) {
  const SHOW = 4;
  const visible = jumelles.slice(0, SHOW);
  const remaining = jumelles.length - SHOW;

  // Build lookup map for twin scores from index
  const indexMap = new Map<string, IndexEntry>();
  if (index) {
    for (const twin of visible) {
      const entry = index.find((e) => e.code === twin.code);
      if (entry) indexMap.set(twin.code, entry);
    }
  }

  return (
    <div
      style={{
        background: "#fff",
        borderTop: "1px solid #e2e8f0",
        padding: "10px 24px",
        position: "sticky",
        bottom: 0,
        zIndex: 20,
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: "#64748b",
          marginBottom: 8,
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        Communes similaires
      </div>
      <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
        {visible.map((twin, i) => {
          const isActive = activeTwinIndex === i;
          const entry = indexMap.get(twin.code);
          return (
            <button
              key={twin.code}
              onClick={() => onSwap(i)}
              style={{
                padding: "8px 16px",
                borderRadius: 10,
                cursor: "pointer",
                fontSize: 12,
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontFamily: "inherit",
                border: isActive ? "2px solid #0F766E" : "1px solid #e2e8f0",
                background: isActive ? "#f0fdf4" : "#fff",
                color: "#1e293b",
                transition: "all 0.15s",
                flexShrink: 0,
              }}
            >
              <ScoreBadge classe={entry?.classe ?? null} size={22} />
              <div style={{ textAlign: "left" }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{twin.nom}</div>
                <div style={{ fontSize: 10, color: "#64748b" }}>
                  {Math.round(twin.similarite * 100)}% similaire
                </div>
              </div>
              {twin.has_msp && (
                <span
                  style={{
                    fontSize: 9,
                    background: "#dcfce7",
                    color: "#166534",
                    padding: "2px 6px",
                    borderRadius: 4,
                    fontWeight: 600,
                  }}
                >
                  Action
                </span>
              )}
            </button>
          );
        })}
        {remaining > 0 && (
          <button
            style={{
              padding: "8px 16px",
              borderRadius: 10,
              border: "1px dashed #cbd5e1",
              background: "#fff",
              cursor: "pointer",
              fontSize: 12,
              color: "#94a3b8",
              fontFamily: "inherit",
              flexShrink: 0,
            }}
          >
            +{remaining} communes
          </button>
        )}
      </div>
    </div>
  );
}
