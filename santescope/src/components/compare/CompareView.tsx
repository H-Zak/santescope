"use client";

import Link from "next/link";
import { useCommuneData } from "@/hooks/useCommuneData";
import { Header } from "@/components/layout/Header";
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
  return (
    <div className={`bg-slate-100 rounded-lg animate-pulse ${className}`} />
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
        <SkeletonCard className="h-20" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col gap-4 py-8">
        <p className="text-slate-600 text-sm">
          {error ?? "Commune introuvable"}
        </p>
        <Link href="/" className="text-teal-700 underline text-sm">
          ← Retour à la recherche
        </Link>
      </div>
    );
  }

  return <CommuneDiagnostic data={data} label={label} labelColor={labelColor} />;
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
    <div className="flex flex-col gap-5">
      <p
        className="text-xs font-semibold uppercase tracking-wide"
        style={{ color: labelColor }}
      >
        {label}
      </p>

      <DataQualityBanner quality={data.data_quality} />

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-4">
          <ScoreBadge classe={data.classe} size={52} />
          <div className="flex-1 min-w-0">
            <p className="text-lg font-semibold text-slate-800">{data.nom}</p>
            <p className="text-sm text-slate-500">
              Dép. {data.dept} · {data.pop.toLocaleString("fr-FR")} hab.
            </p>
          </div>
          <DpeStrip active={data.classe} small />
        </div>
        <ScoreGauge classe={data.classe} score={data.score} />
      </div>

      <MiniMap nom={data.nom} coords={data.coords} />

      <ScoreDetail scoreDetail={data.score_detail} />

      {data.domino && <DominoAlert domino={data.domino} />}

      {data.manques && data.manques.length > 0 && (
        <MissingDoctors
          manques={data.manques}
          pathologies={data.pathologies_dept}
        />
      )}
    </div>
  );
}

export function CompareView({ codeA, codeB }: CompareViewProps) {
  return (
    <>
      <Header />
      <div className="px-8 py-3 flex items-center gap-3">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-700 border border-sky-200">
          Mode comparaison libre
        </span>
        <Link href="/" className="text-sm text-slate-400 hover:text-teal-700 transition-colors">
          ← Nouvelle recherche
        </Link>
      </div>
      <DoublePanelLayout
        left={
          <CommunePanel
            code={codeA}
            label="Commune A"
            labelColor="#0F766E"
          />
        }
        right={
          <CommunePanel
            code={codeB}
            label="Commune B"
            labelColor="#0EA5E9"
          />
        }
      />
    </>
  );
}
