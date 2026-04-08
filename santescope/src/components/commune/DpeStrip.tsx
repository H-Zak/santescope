import { DPE_COLORS, DPE_TEXT_COLORS } from "@/lib/constants";

interface DpeStripProps {
  active: string | null;
  small?: boolean;
}

export function DpeStrip({ active, small = false }: DpeStripProps) {
  const w = small ? 22 : 24;
  const h = small ? 16 : 18;

  return (
    <div style={{ display: "flex", gap: 3 }}>
      {["A", "B", "C", "D", "E"].map((l) => (
        <div
          key={l}
          style={{
            width: w,
            height: h,
            borderRadius: 4,
            background: l === active ? DPE_COLORS[l] : `${DPE_COLORS[l]}22`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 9,
            fontWeight: 700,
            color: l === active ? DPE_TEXT_COLORS[l] : DPE_COLORS[l],
            border: l === active ? `2px solid ${DPE_COLORS[l]}` : "1px solid transparent",
            transition: "all 0.2s",
          }}
        >
          {l}
        </div>
      ))}
    </div>
  );
}
