import { SearchBar } from "@/components/search/SearchBar";

export default function LandingPage() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 py-16"
      style={{
        background: "linear-gradient(180deg, #f0fdf4 0%, #ffffff 60%)",
      }}
    >
      <div className="flex flex-col items-center gap-6 w-full max-w-xl">
        {/* Logo */}
        <div
          className="flex items-center justify-center rounded-2xl"
          style={{ width: 56, height: 56, background: "#0F766E" }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </div>

        {/* Title */}
        <div className="text-center">
          <h1
            className="font-semibold text-[#0F766E]"
            style={{ fontSize: 28, lineHeight: 1.15 }}
          >
            SanteScope
          </h1>
          <p
            className="text-slate-600 mt-2"
            style={{ fontSize: 20, lineHeight: 1.4 }}
          >
            Le diagnostic santé de votre commune
          </p>
        </div>

        {/* Search bar */}
        <div className="w-full">
          <SearchBar fullScreen />
        </div>

        {/* Stats row */}
        <p className="text-slate-400 text-center" style={{ fontSize: 12 }}>
          35 000 communes · 200 000 médecins · 9 sources open data
        </p>
      </div>
    </main>
  );
}
