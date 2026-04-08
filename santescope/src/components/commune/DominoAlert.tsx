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
          marginBottom: 4,
        }}
      >
        Alerte succession médicale
      </div>
      {medecinTotal !== undefined && (
        <div style={{ fontSize: 11, color: isCritical ? "#991B1B" : "#9a3412", lineHeight: 1.5 }}>
          {medecinTotal} médecins actifs dans la commune — dont {nb55} ont 55+ ans ({pct55}%)
        </div>
      )}
      <div style={{ fontSize: 11, color: isCritical ? "#991B1B" : "#9a3412", lineHeight: 1.5 }}>
        {pct55}% des médecins ont 55+ ans (moy. dept : {pctDept}%)
      </div>
      <div style={{ fontSize: 11, color: isCritical ? "#991B1B" : "#9a3412", lineHeight: 1.5 }}>
        Estimation 2030 : {domino.projection_2030}
      </div>
    </div>
  );
}
