import { SearchBar } from "@/components/search/SearchBar";

export default function LandingPage() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 py-16"
      style={{
        background:
          "radial-gradient(ellipse at 50% 0%, #ecfdf5 0%, #f8fafc 50%, #fff 100%)",
      }}
    >
      <div className="flex flex-col items-center gap-6 w-full max-w-xl">
        {/* Logo */}
        <div
          className="flex items-center justify-center"
          style={{
            width: 60,
            height: 60,
            borderRadius: 16,
            background: "linear-gradient(135deg, #0F766E, #0d9488)",
            boxShadow: "0 8px 32px rgba(15,118,110,0.2)",
          }}
        >
          <svg
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2.2"
            strokeLinecap="round"
          >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </div>

        {/* Title */}
        <div className="text-center">
          <h1
            style={{
              fontSize: 42,
              fontWeight: 800,
              color: "#0F766E",
              margin: 0,
              letterSpacing: "-0.03em",
            }}
          >
            SanteScope
          </h1>
          <p
            style={{
              fontSize: 17,
              color: "#64748b",
              marginTop: 10,
              textAlign: "center",
              maxWidth: 420,
              lineHeight: 1.5,
            }}
          >
            Diagnostic territorial de santé.
            <br />
            Comparez votre commune, découvrez ses jumelles.
          </p>
        </div>

        {/* Search bar */}
        <div className="w-full mt-4">
          <SearchBar fullScreen />
        </div>

        {/* Sources */}
        <div className="flex gap-8 mt-12 flex-wrap justify-center">
          {[
            ["INSEE", "Démographie"],
            ["DREES", "Offre de soins"],
            ["SPF", "Épidémiologie"],
            ["SNDS", "Parcours"],
          ].map(([src, desc]) => (
            <div key={src} className="text-center">
              <div style={{ fontSize: 13, fontWeight: 600, color: "#0F766E" }}>
                {src}
              </div>
              <div style={{ fontSize: 10, color: "#94a3b8" }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
