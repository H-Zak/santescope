import { DPE_COLORS, DPE_LABELS } from "@/lib/constants";
import { toHealthScore } from "@/lib/score";

interface ScoreGaugeProps {
  classe: string | null;
  score: number | null;
}

export function ScoreGauge({ classe, score }: ScoreGaugeProps) {
  const barColor = classe ? DPE_COLORS[classe] : "#CBD5E1";
  const label = classe ? DPE_LABELS[classe] : null;
  const healthScore = score !== null ? toHealthScore(score) : null;
  const pct = healthScore !== null ? (healthScore / 10) * 100 : 0;

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2.5 rounded-full bg-slate-100 overflow-hidden">
          <div
            style={{
              width: `${pct}%`,
              background: `linear-gradient(90deg, ${barColor}, ${barColor}bb)`,
            }}
            className="h-full rounded-full transition-all duration-700"
            style-timing="cubic-bezier(0.22,1,0.36,1)"
          />
        </div>
        <span
          className="text-base font-bold text-slate-800 shrink-0"
          style={{ minWidth: 50, textAlign: "right" }}
        >
          {healthScore !== null ? `${healthScore}/10` : (
            <span className="text-slate-400 text-sm">N/D</span>
          )}
        </span>
      </div>
      {label && (
        <p className="text-xs text-slate-500">{label}</p>
      )}
    </div>
  );
}
