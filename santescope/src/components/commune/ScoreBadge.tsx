import { DPE_COLORS, DPE_TEXT_COLORS } from "@/lib/constants";

interface ScoreBadgeProps {
  classe: string | null;
  size?: number;
}

export function ScoreBadge({ classe, size = 44 }: ScoreBadgeProps) {
  const bg = classe ? DPE_COLORS[classe] : "#CBD5E1";
  const color = classe ? DPE_TEXT_COLORS[classe] : "#64748B";
  const label = classe ?? "–";

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.22,
        background: `linear-gradient(135deg, ${bg}, ${bg}dd)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.42,
        fontWeight: 700,
        color,
        flexShrink: 0,
        boxShadow: `0 2px 8px ${bg}33`,
      }}
    >
      {label}
    </div>
  );
}
