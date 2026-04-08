"use client";

import Link from "next/link";
import { useCommuneData } from "@/hooks/useCommuneData";
import { DoublePanelLayout } from "@/components/layout/DoublePanelLayout";
import { DataQualityBanner } from "@/components/commune/DataQualityBanner";
import { ScoreBadge } from "@/components/commune/ScoreBadge";
import { DpeStrip } from "@/components/commune/DpeStrip";
import { ScoreGauge } from "@/components/commune/ScoreGauge";
import { MiniMap } from "@/components/commune/MiniMap";
import { ScoreDetail } from "@/components/commune/ScoreDetail";
import { DominoAlert } from "@/components/commune/DominoAlert";
import { MissingDoctors } from "@/components/commune/MissingDoctors";
import { CommuneData } from "@/lib/types";

interface CompareViewProps {
  codeA: string;
  codeB: string;
}

function SkeletonCard({ className = "" }: { className?: string }) {
  return <div className={`bg-slate-100 rounded-lg animate-pulse ${className}`} />;
}

function CommuneDiagnostic({
  data,
  label,
  labelColor,
}: {
  data: CommuneData;
  label: string;
  labelColor: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div style={{ fontSize: 11, fontWeight: 700, color: labelColor, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
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
      {data.domino && <DominoAlert domino={data.domino} medecinTotal={data.medecins.total} />}
      {data.manques && data.manques.length > 0 && (
        <MissingDoctors manques={data.manques} pathologies={data.pathologies_dept} />
      )}
    </div>
  );
}

function CommunePanel({
  code,
  label,
  labelColor,
}: {
  code: string;
  label: string;
  labelColor: string;
}) {
  const { data, loading, error } = useCommuneData(code);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <SkeletonCard className="h-6 w-32" />
        <SkeletonCard className="h-16" />
        <SkeletonCard className="h-24" />
        <SkeletonCard className="h-32" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col gap-4 py-8">
        <p className="text-slate-600 text-sm">{error ?? "Commune introuvable"}</p>
        <Link href="/" className="text-teal-700 underline text-sm">← Retour à la recherche</Link>
      </div>
    );
  }

  return <CommuneDiagnostic data={data} label={label} labelColor={labelColor} />;
}

export function CompareView({ codeA, codeB }: CompareViewProps) {
  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {/* Navbar */}
      <div
        style={{
          background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "0 20px", height: 52,
          display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 20,
        }}
      >
        <div className="flex items-center gap-2.5">
          <Link href="/" className="flex items-center gap-2.5" style={{ textDecoration: "none" }}>
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
            <span style={{ fontWeight: 700, fontSize: 16, color: "#0F766E" }}>SanteScope</span>
          </Link>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-700 border border-sky-200 ml-3">
            Mode comparaison libre
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 hidden md:block">
            Consultez une commune pour voir ses jumelles automatiques
          </span>
          <Link
            href="/"
            style={{
              padding: "6px 14px", borderRadius: 8, border: "1px solid #e2e8f0",
              background: "#fff", fontSize: 12, color: "#64748b", textDecoration: "none",
            }}
          >
            ← Nouvelle recherche
          </Link>
        </div>
      </div>

      <DoublePanelLayout
        left={<CommunePanel code={codeA} label="Commune A" labelColor="#0F766E" />}
        right={<CommunePanel code={codeB} label="Commune B" labelColor="#0EA5E9" />}
      />
    </div>
  );
}
