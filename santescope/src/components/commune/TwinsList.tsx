import { CommuneData } from "@/lib/types";

interface TwinsListProps {
  jumelles: CommuneData["jumelles"];
  activeTwinIndex: number;
  onSwap: (index: number) => void;
}

export function TwinsList({ jumelles, activeTwinIndex, onSwap }: TwinsListProps) {
  const SHOW = 3;
  const visible = jumelles.slice(0, SHOW);
  const remaining = jumelles.length - SHOW;

  return (
    <div className="flex flex-row gap-3 overflow-x-auto pb-1">
      {visible.map((twin, i) => (
        <button
          key={twin.code}
          onClick={() => onSwap(i)}
          className={`flex flex-col items-start gap-1 p-3 rounded-lg shrink-0 transition-all text-left ${
            activeTwinIndex === i
              ? "border-2 border-teal-700 bg-teal-50"
              : "border border-slate-200 bg-white hover:border-slate-300"
          }`}
        >
          <span className="font-medium text-sm text-slate-800">{twin.nom}</span>
          <span className="text-xs text-slate-500">
            {Math.round(twin.similarite * 100)}% similaire
          </span>
        </button>
      ))}
      {remaining > 0 && (
        <button className="flex items-center px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-500 shrink-0 hover:border-slate-300">
          +{remaining} communes jumelées
        </button>
      )}
    </div>
  );
}
