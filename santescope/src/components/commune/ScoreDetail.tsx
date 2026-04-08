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
    <div className="flex flex-col">
      {rows.map((row) => {
        const better = getBetter(row);
        return (
          <div
            key={row.label}
            className={`flex items-center py-2 border-b border-slate-100 ${row.unavailable ? "opacity-50" : ""}`}
          >
            <span className="flex-1 text-[13px] text-slate-600">{row.label}</span>
            <span className="text-[15px] font-semibold text-slate-800 mr-2">
              {row.value}
            </span>
            <div
              className="shrink-0 text-center rounded-md px-2 py-1"
              style={{
                fontSize: 10,
                lineHeight: 1.3,
                background: better === null ? "#f1f5f9" : better ? "#f0fdf4" : "#fef2f2",
                color: better === null ? "#94a3b8" : better ? "#16a34a" : "#DC2626",
              }}
            >
              {better === null ? (
                <span>—</span>
              ) : (
                <>
                  <div>{better ? "▲" : "▼"} moy. nat.</div>
                  <div style={{ fontWeight: 600 }}>({row.national})</div>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
