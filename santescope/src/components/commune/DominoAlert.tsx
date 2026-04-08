import { CommuneData } from "@/lib/types";

interface DominoAlertProps {
  domino: NonNullable<CommuneData["domino"]>;
  medecinTotal?: number;
}

export function DominoAlert({ domino, medecinTotal }: DominoAlertProps) {
  const isCritical = domino.pct_55_plus > 0.5;
  const pct55 = Math.round(domino.pct_55_plus * 100);
  const pctDept = Math.round(domino.pct_55_plus_dept * 100);
  const nb55 = Math.round(domino.medecins_55_plus);

  const hasTrend = domino.trend_cagr !== undefined && domino.trend_delta_annuel !== undefined;
  const trendPositive = hasTrend && domino.trend_cagr! > 0;

  return (
    <div
      style={{
        background: isCritical ? "#fef2f2" : "#fff7ed",
        borderLeft: `3px solid ${isCritical ? "#EF4444" : "#F97316"}`,
        borderRadius: 8,
        padding: "12px 14px",
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: isCritical ? "#DC2626" : "#EA580C",
          marginBottom: 6,
        }}
      >
        Alerte succession médicale
      </div>

      {medecinTotal !== undefined && (
        <div style={{ fontSize: 11, color: isCritical ? "#991B1B" : "#9a3412", lineHeight: 1.6 }}>
          <strong>{medecinTotal}</strong> médecins actifs — dont <strong>{nb55}</strong> ont 55+ ans ({pct55}%, moy. dept : {pctDept}%)
        </div>
      )}

      <div style={{ fontSize: 11, color: isCritical ? "#991B1B" : "#9a3412", lineHeight: 1.6 }}>
        Estimation 2030 : {domino.projection_2030}
      </div>

      {hasTrend && (
        <div
          style={{
            marginTop: 6,
            padding: "6px 10px",
            borderRadius: 6,
            background: trendPositive ? "#f0fdf4" : (isCritical ? "#fef2f2" : "#fff7ed"),
            border: `1px solid ${trendPositive ? "#bbf7d0" : isCritical ? "#fecaca" : "#fed7aa"}`,
            fontSize: 11,
            lineHeight: 1.5,
          }}
        >
          <span style={{ fontWeight: 600, color: trendPositive ? "#16a34a" : "#DC2626" }}>
            {trendPositive ? "▲" : "▼"} Tendance départementale (2012-2025)
          </span>
          <span style={{ color: "#64748b" }}>
            {" "}: {domino.trend_cagr! > 0 ? "+" : ""}{domino.trend_cagr}%/an
            ({domino.trend_delta_annuel! > 0 ? "+" : ""}{Math.round(domino.trend_delta_annuel!)} médecins/an)
          </span>
          {!trendPositive && (
            <div style={{ color: "#991B1B", marginTop: 2 }}>
              Les départs ne seront pas compensés par les installations
            </div>
          )}
          {trendPositive && (
            <div style={{ color: "#166534", marginTop: 2 }}>
              Les installations compensent partiellement les départs
            </div>
          )}
        </div>
      )}
    </div>
  );
}
