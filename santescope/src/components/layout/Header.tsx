import Link from "next/link";
import { SearchBar } from "@/components/search/SearchBar";

export function Header() {
  return (
    <header className="sticky top-0 z-40 h-14 bg-white border-b border-slate-200 flex items-center px-6 justify-between">
      <Link href="/" className="flex items-center gap-2 shrink-0">
        <div
          className="flex items-center justify-center rounded-lg"
          style={{ width: 30, height: 30, background: "#0F766E" }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </div>
        <span className="font-semibold text-base text-[#0F766E] tracking-tight">
          SanteScope
        </span>
      </Link>

      <SearchBar fullScreen={false} />
    </header>
  );
}
