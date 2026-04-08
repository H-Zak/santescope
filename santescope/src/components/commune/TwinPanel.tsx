import { ArrowRight } from "lucide-react";
import { CommuneData } from "@/lib/types";

type Twin = CommuneData["jumelles"][number];

interface TwinPanelProps {
  twin: Twin;
}

export function TwinPanel({ twin }: TwinPanelProps) {
  const aplImproved = twin.apl_apres > twin.apl_avant;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="text-lg font-semibold text-slate-800">{twin.nom}</span>
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-700">
          {Math.round(twin.similarite * 100)}% similaire
        </span>
        {twin.has_msp && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
            MSP installée
          </span>
        )}
      </div>

      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
          Actions réalisées
        </p>
        {twin.actions.length === 0 ? (
          <p className="text-sm text-slate-400">Aucune action identifiée</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {twin.actions.map((action, i) => (
              <li key={i} className="text-sm text-slate-700">
                • {action}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
          Évolution APL
        </p>
        <div className="flex items-center gap-3">
          <div className="text-center">
            <p className="text-xs text-slate-500">Avant</p>
            <p className="text-xl font-semibold text-slate-800">{twin.apl_avant}</p>
          </div>
          <ArrowRight
            className={`w-5 h-5 ${aplImproved ? "text-green-500" : "text-red-400"}`}
          />
          <div className="text-center">
            <p className="text-xs text-slate-500">Après</p>
            <p
              className={`text-xl font-semibold ${
                aplImproved ? "text-green-600" : "text-red-500"
              }`}
            >
              {twin.apl_apres}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
