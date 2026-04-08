interface MiniMapProps {
  nom: string;
  coords: [number, number];
}

export function MiniMap({ nom, coords: _coords }: MiniMapProps) {
  return (
    <div
      style={{
        width: "100%",
        height: 70,
        background: "#f0fdf4",
        borderRadius: 10,
        border: "1px solid #e2e8f0",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <svg
        viewBox="0 0 200 100"
        width="100%"
        height="100%"
        style={{ position: "absolute" }}
      >
        <path
          d="M20,80 Q40,20 80,40 T140,30 T180,60 Q190,80 160,85 T100,90 T40,85 Z"
          fill="#0F766E"
          opacity="0.1"
        />
        <path
          d="M20,80 Q40,20 80,40 T140,30 T180,60 Q190,80 160,85 T100,90 T40,85 Z"
          fill="none"
          stroke="#0F766E"
          strokeWidth="0.8"
          opacity="0.3"
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 3,
        }}
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
        <span style={{ fontSize: 10, fontWeight: 600, color: "#0F766E" }}>
          {nom}
        </span>
      </div>
    </div>
  );
}
