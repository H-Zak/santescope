import { DPE_COLORS, DPE_LABELS, BAR_W } from "@/lib/constants";

interface ScoreGaugeProps {
  classe: string | null;
  score: number | null;
}

export function ScoreGauge({ classe, score }: ScoreGaugeProps) {
  const barColor = classe ? DPE_COLORS[classe] : "#CBD5E1";
  const barWidth = classe ? BAR_W[classe] : "0%";
  const label = classe ? DPE_LABELS[classe] : null;

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex items-center gap-3">
        <div className="flex-1 h-3 rounded-full bg-slate-100 overflow-hidden">
          <div
            style={{ width: barWidth, background: barColor }}
            className="h-full rounded-full transition-all duration-500"
          />
        </div>
        <span
          className="text-xl font-semibold text-slate-800 shrink-0"
          style={{ minWidth: "60px", textAlign: "right" }}
        >
          {score !== null ? `${score.toFixed(1)}/10` : (
            <span className="text-slate-400 text-sm">Données insuffisantes</span>
          )}
        </span>
      </div>
      {label && (
        <p className="text-sm text-slate-500">{label}</p>
      )}
    </div>
  );
}
