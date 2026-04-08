import { useState } from "react";
import { CommuneData } from "@/lib/types";

interface MissingDoctorsProps {
  manques: string[];
  pathologies: CommuneData["pathologies_dept"];
}

const SPECIALTY_TO_PATHOLOGY: Record<string, keyof CommuneData["pathologies_dept"]> = {
  endocrinologue: "diabete",
  cardiologue: "cardiovasculaire",
  psychiatre: "psychiatrique",
  oncologue: "cancers",
  pneumologue: "respiratoire",
};

const PATHOLOGY_LABELS: Record<string, string> = {
  diabete: "Diabète",
  cardiovasculaire: "Maladies cardiovasculaires",
  psychiatrique: "Santé psychiatrique",
  cancers: "Cancers",
  respiratoire: "Maladies respiratoires",
};

export function MissingDoctors({ manques, pathologies }: MissingDoctorsProps) {
  const [showAll, setShowAll] = useState(false);
  const MAX = 5;
  const visible = showAll ? manques : manques.slice(0, MAX);
  const remaining = manques.length - MAX;

  return (
    <div>
      <p className="font-semibold text-sm text-slate-800 mb-2">
        Spécialités manquantes
      </p>
      <ul className="flex flex-col gap-1">
        {visible.map((manque) => {
          const key = manque.toLowerCase();
          const pathKey = SPECIALTY_TO_PATHOLOGY[key];
          if (pathKey && pathologies[pathKey] !== undefined) {
            return (
              <li key={manque} className="text-sm text-slate-600">
                • {manque} —{" "}
                <span className="text-slate-500">
                  {PATHOLOGY_LABELS[pathKey]}:{" "}
                  {pathologies[pathKey].toFixed(1)}
                </span>
              </li>
            );
          }
          return (
            <li key={manque} className="text-sm text-slate-600">
              • {manque}
            </li>
          );
        })}
      </ul>
      {!showAll && remaining > 0 && (
        <button
          onClick={() => setShowAll(true)}
          className="text-xs text-teal-700 underline mt-1"
        >
          +{remaining} autres
        </button>
      )}
    </div>
  );
}
