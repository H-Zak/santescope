"use client";

import { useState } from "react";
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
import { TwinPanel } from "@/components/commune/TwinPanel";
import { TwinsList } from "@/components/commune/TwinsList";

interface CommuneViewProps {
  code: string;
}

function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-slate-100 rounded-lg animate-pulse ${className}`} />
  );
}

export function CommuneView({ code }: CommuneViewProps) {
  const { data, loading, error } = useCommuneData(code);
  const [activeTwin, setActiveTwin] = useState(0);

  if (loading) {
    return (
      <>
        <Header />
        <DoublePanelLayout
          left={
            <div className="flex flex-col gap-4">
              <SkeletonCard className="h-16" />
              <SkeletonCard className="h-24" />
              <SkeletonCard className="h-32" />
              <SkeletonCard className="h-20" />
            </div>
          }
          right={
            <div className="flex flex-col gap-4">
              <SkeletonCard className="h-16" />
              <SkeletonCard className="h-40" />
            </div>
          }
        />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <p className="text-slate-600">{error}</p>
          <Link href="/" className="text-teal-700 underline text-sm">
            ← Retour à la recherche
          </Link>
        </div>
      </>
    );
  }

  if (!data) return null;

  const activeTwinData = data.jumelles[activeTwin] ?? null;

  const leftPanel = (
    <div className="flex flex-col gap-5">
      <p className="text-xs font-semibold text-teal-700 uppercase tracking-wide">
        Ma commune
      </p>

      <DataQualityBanner quality={data.data_quality} />

      {/* Score hero */}
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

  const rightPanel = (
    <div className="flex flex-col gap-5">
      <p className="text-xs font-semibold text-sky-600 uppercase tracking-wide">
        Commune jumelle
      </p>

      {activeTwinData ? (
        <TwinPanel twin={activeTwinData} />
      ) : (
        <p className="text-slate-400 text-sm">
          Aucune commune jumelle identifiée
        </p>
      )}

      <button
        disabled
        className="mt-2 px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-400 cursor-not-allowed"
      >
        Télécharger le rapport (bientôt)
      </button>
    </div>
  );

  return (
    <>
      <Header />
      <DoublePanelLayout left={leftPanel} right={rightPanel} />
      {data.jumelles.length > 0 && (
        <div className="px-8 pb-8">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Comparer avec d&apos;autres communes similaires
          </p>
          <TwinsList
            jumelles={data.jumelles}
            activeTwinIndex={activeTwin}
            onSwap={setActiveTwin}
          />
        </div>
      )}
    </>
  );
}
