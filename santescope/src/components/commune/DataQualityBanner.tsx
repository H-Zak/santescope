import { AlertTriangle } from "lucide-react";
import { CommuneData } from "@/lib/types";

interface DataQualityBannerProps {
  quality: CommuneData["data_quality"];
}

export function DataQualityBanner({ quality }: DataQualityBannerProps) {
  if (quality === "complete" || quality === "full") return null;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
      <AlertTriangle className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
      <p className="text-sm text-yellow-800">
        Données partielles — certains indicateurs sont estimés ou indisponibles
      </p>
    </div>
  );
}
