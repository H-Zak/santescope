"use client";

import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

export function ScoreMethodology() {
  return (
    <Tooltip>
      <TooltipTrigger
        style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 18, height: 18, borderRadius: "50%",
          background: "#f1f5f9", color: "#64748b",
          fontSize: 10, fontWeight: 700, cursor: "help",
          border: "none", padding: 0, marginLeft: 6, flexShrink: 0,
          fontFamily: "inherit", verticalAlign: "middle",
        }}
      >
        i
      </TooltipTrigger>
      <TooltipContent side="bottom" style={{ maxWidth: 300, lineHeight: 1.5 }}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>Comment est calculé ce score ?</div>
        <div>Moyenne de 4 indicateurs normalisés (0-10), poids égaux :</div>
        <div style={{ marginTop: 4 }}>
          <div>&#8226; 25% Accès aux soins (APL inversé)</div>
          <div>&#8226; 25% Précarité (revenu médian inversé)</div>
          <div>&#8226; 25% Vieillissement (% 75+ ans)</div>
          <div>&#8226; 25% Accès urgences (temps trajet)</div>
        </div>
        <div style={{ marginTop: 6, opacity: 0.8, fontSize: 10 }}>
          Score élevé = commune plus vulnérable.
          Classes A-E par quintiles (chaque classe ≈ 20% des communes).
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
