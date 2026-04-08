import { CommuneData } from "@/lib/types";

interface DominoAlertProps {
  domino: NonNullable<CommuneData["domino"]>;
}

export function DominoAlert({ domino }: DominoAlertProps) {
  const isCritical = domino.pct_55_plus > 0.5;

  return (
    <div
      className={`rounded-lg border-l-4 p-4 ${
        isCritical
          ? "bg-red-50 border-red-400"
          : "bg-orange-50 border-orange-400"
      }`}
    >
      <p
        className={`font-semibold text-sm mb-1 ${
          isCritical ? "text-red-900" : "text-orange-900"
        }`}
      >
        Alerte succession médicale
      </p>
      <p className={`text-sm ${isCritical ? "text-red-800" : "text-orange-800"}`}>
        {Math.round(domino.pct_55_plus * 100)}% des médecins ont 55+ ans (moy.
        dept : {Math.round(domino.pct_55_plus_dept * 100)}%)
      </p>
      <p className={`text-sm mt-0.5 ${isCritical ? "text-red-800" : "text-orange-800"}`}>
        Estimation 2030 : {domino.projection_2030}
      </p>
    </div>
  );
}
