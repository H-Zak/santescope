"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Download } from "lucide-react";
import { useCommuneData } from "@/hooks/useCommuneData";
import { useSearchIndex } from "@/hooks/useSearchIndex";
import { filterIndex } from "@/lib/search";
import { toHealthScore } from "@/lib/score";
import { DoublePanelLayout } from "@/components/layout/DoublePanelLayout";
import { DataQualityBanner } from "@/components/commune/DataQualityBanner";
import { ScoreBadge } from "@/components/commune/ScoreBadge";
import { DpeStrip } from "@/components/commune/DpeStrip";
import { ScoreGauge } from "@/components/commune/ScoreGauge";
import { MiniMap } from "@/components/commune/MiniMap";
import { ScoreDetail } from "@/components/commune/ScoreDetail";
import { DominoAlert } from "@/components/commune/DominoAlert";
import { MissingDoctors } from "@/components/commune/MissingDoctors";
import { TwinPanel } from "@/components/commune/TwinPanel";
import { TwinsList } from "@/components/commune/TwinsList";
import { IndexEntry } from "@/lib/types";
import { DPE_COLORS, DPE_TEXT_COLORS } from "@/lib/constants";
import { PdfExportContent } from "@/components/pdf/PdfExportContent";
import { PdfDownloadButton } from "@/components/pdf/PdfDownloadButton";

interface CommuneViewProps {
  code: string;
}

function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-slate-100 rounded-lg animate-pulse ${className}`} />
  );
}

function InlineScoreBadge({ classe }: { classe: string | null }) {
  if (!classe) {
    return (
      <span
        style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 20, height: 16, borderRadius: 3,
          background: "#CBD5E1", color: "#475569", fontSize: 9, fontWeight: 700, flexShrink: 0,
        }}
      >–</span>
    );
  }
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: 20, height: 16, borderRadius: 3,
        background: DPE_COLORS[classe] ?? "#CBD5E1",
        color: DPE_TEXT_COLORS[classe] ?? "#FFFFFF",
        fontSize: 9, fontWeight: 700, flexShrink: 0,
      }}
    >{classe}</span>
  );
}

function CompareSearchInline({ currentCode }: { currentCode: string }) {
  const router = useRouter();
  const { index } = useSearchIndex();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<IndexEntry[]>([]);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = useCallback(
    (value: string) => {
      setQuery(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        if (!index || !value.trim()) { setResults([]); setOpen(false); return; }
        setResults(filterIndex(index, value));
        setOpen(true);
        setHighlighted(-1);
      }, 150);
    },
    [index]
  );

  const selectEntry = useCallback(
    (entry: IndexEntry) => {
      setOpen(false);
      router.push(`/comparer/${currentCode}/${entry.code}`);
    },
    [router, currentCode]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setHighlighted((h) => Math.min(h + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHighlighted((h) => Math.max(h - 1, 0)); }
    else if (e.key === "Enter" && highlighted >= 0) { e.preventDefault(); selectEntry(results[highlighted]); }
    else if (e.key === "Escape") setOpen(false);
  };

  return (
    <div className="relative">
      <div className="flex items-center bg-white border-2 rounded-xl px-3 h-10 gap-2 transition-colors shadow-sm focus-within:border-[#0F766E] border-slate-200">
        <Search size={16} className="text-slate-400 shrink-0" />
        <input
          ref={inputRef} type="text" placeholder="Rechercher une commune..."
          value={query} onChange={(e) => handleChange(e.target.value)} onKeyDown={handleKeyDown}
          onFocus={() => { if (results.length > 0) setOpen(true); }}
          className="flex-1 bg-transparent outline-none text-sm text-slate-800 placeholder:text-slate-400"
          autoFocus
        />
      </div>
      {open && (
        <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-50">
          {results.length === 0 && query.length > 0 ? (
            <div className="px-4 py-3 text-sm text-slate-500">Aucune commune trouvée</div>
          ) : (
            results.map((entry, i) => (
              <div key={entry.code} onMouseDown={() => selectEntry(entry)} onMouseEnter={() => setHighlighted(i)}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${i < results.length - 1 ? "border-b border-slate-100" : ""} ${highlighted === i ? "bg-[#f0fdf4]" : "hover:bg-[#f8fafc]"}`}
              >
                <InlineScoreBadge classe={entry.classe} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-800 truncate">{entry.nom}</div>
                  <div className="text-xs text-slate-400">Dép. {entry.dept} · {entry.pop.toLocaleString("fr-FR")} hab.</div>
                </div>
                {entry.score !== null && (
                  <span className="text-xs text-slate-500">{toHealthScore(entry.score)}/10</span>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export function CommuneView({ code }: CommuneViewProps) {
  const { data, loading, error } = useCommuneData(code);
  const [activeTwin, setActiveTwin] = useState(0);
  const [showCompareSearch, setShowCompareSearch] = useState(false);

  if (loading) {
    return (
      <>
        <Navbar onBack={null} />
        <DoublePanelLayout
          left={<div className="flex flex-col gap-4"><SkeletonCard className="h-16" /><SkeletonCard className="h-24" /><SkeletonCard className="h-32" /></div>}
          right={<div className="flex flex-col gap-4"><SkeletonCard className="h-16" /><SkeletonCard className="h-40" /></div>}
        />
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <Navbar onBack={null} />
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <p className="text-slate-600">{error}</p>
          <Link href="/" className="text-teal-700 underline text-sm">← Retour à la recherche</Link>
        </div>
      </>
    );
  }

  const activeTwinData = data.jumelles[activeTwin] ?? null;

  const leftPanel = (
    <div className="flex flex-col gap-3">
      <div style={{ fontSize: 11, fontWeight: 700, color: "#0F766E", textTransform: "uppercase", letterSpacing: "0.06em" }}>
        Ma commune
      </div>

      <DataQualityBanner quality={data.data_quality} />

      <div className="flex items-center gap-3">
        <ScoreBadge classe={data.classe} size={48} />
        <div className="flex-1 min-w-0">
          <p className="text-lg font-bold text-slate-900 tracking-tight">{data.nom}</p>
          <p className="text-xs text-slate-500">Dép. {data.dept} · {data.pop.toLocaleString("fr-FR")} hab.</p>
        </div>
        <DpeStrip active={data.classe} />
      </div>

      <ScoreGauge classe={data.classe} score={data.score} />
      <MiniMap nom={data.nom} coords={data.coords} />
      <ScoreDetail scoreDetail={data.score_detail} />
      {data.domino && (
        <DominoAlert domino={data.domino} medecinTotal={data.medecins.total} />
      )}
      {data.manques && data.manques.length > 0 && (
        <MissingDoctors manques={data.manques} pathologies={data.pathologies_dept} />
      )}
    </div>
  );

  const rightPanel = (
    <div className="flex flex-col gap-3">
      <div style={{ fontSize: 11, fontWeight: 700, color: "#0EA5E9", textTransform: "uppercase", letterSpacing: "0.06em" }}>
        Commune jumelle
      </div>

      {activeTwinData ? (
        <TwinPanel twin={activeTwinData} />
      ) : (
        <p className="text-slate-400 text-sm">Aucune commune jumelle identifiée</p>
      )}

      <div className="flex flex-col gap-2 mt-2">
        <button
          onClick={() => setShowCompareSearch((v) => !v)}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 10,
            border: "1.5px dashed #0EA5E9",
            background: "#f0f9ff",
            cursor: "pointer",
            fontSize: 13,
            color: "#0EA5E9",
            fontWeight: 500,
            fontFamily: "inherit",
          }}
        >
          Comparer avec une autre commune...
        </button>
        {showCompareSearch && <CompareSearchInline currentCode={code} />}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <Navbar onBack="/" downloadData={data ? { code: data.code, nom: data.nom } : undefined} />
      <DoublePanelLayout left={leftPanel} right={rightPanel} />
      <PdfExportContent commune={data} />
      {data.jumelles.length > 0 && (
        <TwinsList jumelles={data.jumelles} activeTwinIndex={activeTwin} onSwap={setActiveTwin} />
      )}
    </div>
  );
}

function Navbar({
  onBack,
  downloadData,
}: {
  onBack: string | null;
  downloadData?: { code: string; nom: string };
}) {
  return (
    <div
      style={{
        background: "#fff",
        borderBottom: "1px solid #e2e8f0",
        padding: "0 20px",
        height: 52,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 20,
      }}
    >
      <div className="flex items-center gap-2.5">
        <Link href="/" className="flex items-center gap-2.5">
          <div
            style={{
              width: 30, height: 30, borderRadius: 8,
              background: "linear-gradient(135deg,#0F766E,#0d9488)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: 16, color: "#0F766E", letterSpacing: "-0.01em" }}>
            SanteScope
          </span>
        </Link>
      </div>
      <div className="flex items-center gap-2">
        {onBack && (
          <Link
            href={onBack}
            style={{
              padding: "6px 14px", borderRadius: 8, border: "1px solid #e2e8f0",
              background: "#fff", fontSize: 12, color: "#64748b", textDecoration: "none",
            }}
          >
            ← Nouvelle recherche
          </Link>
        )}
        {downloadData && (
          <PdfDownloadButton communeCode={downloadData.code} communeNom={downloadData.nom} />
        )}
      </div>
    </div>
  );
}
