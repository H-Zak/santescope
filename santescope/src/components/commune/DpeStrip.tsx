import { DPE_COLORS, DPE_TEXT_COLORS } from "@/lib/constants";

interface DpeStripProps {
  active: string | null;
  small?: boolean;
}

export function DpeStrip({ active, small = false }: DpeStripProps) {
  const w = small ? 20 : 24;
  const h = small ? 15 : 18;

  return (
    <div style={{ display: "flex", gap: 2 }}>
      {["A", "B", "C", "D", "E"].map((l) => (
        <div
          key={l}
          style={{
            width: w,
            height: h,
            borderRadius: 3,
            background: DPE_COLORS[l],
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 9,
            fontWeight: 700,
            color: DPE_TEXT_COLORS[l],
            border: l === active ? "2px solid #0F766E" : "2px solid transparent",
            opacity: l === active ? 1 : 0.5,
          }}
        >
          {l}
        </div>
      ))}
    </div>
  );
}
