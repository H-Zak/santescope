interface MiniMapProps {
  nom: string;
  coords: [number, number];
}

export function MiniMap({ nom, coords: _coords }: MiniMapProps) {
  return (
    <div
      className="w-full rounded-lg border border-slate-200 relative overflow-hidden"
      style={{ height: 100, background: "#f0fdf4" }}
    >
      <svg
        viewBox="0 0 200 100"
        width="100%"
        height="100%"
        style={{ position: "absolute", top: 0, left: 0, opacity: 0.15 }}
      >
        <path
          d="M20,80 Q40,20 80,40 T140,30 T180,60 Q190,80 160,85 T100,90 T40,85 Z"
          fill="#0F766E"
        />
      </svg>
      <div
        style={{ position: "relative" }}
        className="flex flex-col items-center justify-center h-full gap-1"
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "#0F766E",
            border: "2px solid #fff",
            boxShadow: "0 0 0 2px #0F766E",
          }}
        />
        <span
          style={{ fontSize: 10, fontWeight: 600, color: "#0F766E" }}
        >
          {nom}
        </span>
      </div>
    </div>
  );
}
