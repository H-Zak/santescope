import { ArrowUp, ArrowDown } from "lucide-react";
import { CommuneData } from "@/lib/types";

interface ScoreDetailProps {
  scoreDetail: CommuneData["score_detail"];
}

interface Row {
  label: string;
  value: string;
  national: string;
  higherIsBetter: boolean;
  unavailable?: boolean;
}

export function ScoreDetail({ scoreDetail }: ScoreDetailProps) {
  const rows: Row[] = [
    {
      label: "Accès aux soins (APL)",
      value: scoreDetail.apl.toFixed(1),
      national: scoreDetail.apl_national.toFixed(1),
      higherIsBetter: true,
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
      value: scoreDetail.temps_urgences_min.toFixed(0) + " min",
      national: scoreDetail.temps_urgences_national.toFixed(0) + " min",
      higherIsBetter: false,
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
    <div className="flex flex-col gap-2">
      {rows.map((row) => {
        const better = getBetter(row);
        return (
          <div
            key={row.label}
            className={`flex items-center gap-2 text-sm ${row.unavailable ? "opacity-50" : ""}`}
          >
            <span className="flex-1 text-slate-600">{row.label}</span>
            <span className="font-medium text-slate-800 shrink-0">
              {row.value}
            </span>
            <div className="shrink-0 flex items-center gap-0.5 w-20 justify-end">
              {better === null ? (
                <span className="text-xs text-slate-400">—</span>
              ) : better ? (
                <>
                  <ArrowUp className="w-3 h-3 text-green-600" />
                  <span className="text-xs text-green-600">
                    mieux que moy. nat. ({row.national})
                  </span>
                </>
              ) : (
                <>
                  <ArrowDown className="w-3 h-3 text-red-500" />
                  <span className="text-xs text-red-500">
                    moy. nat. ({row.national})
                  </span>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
