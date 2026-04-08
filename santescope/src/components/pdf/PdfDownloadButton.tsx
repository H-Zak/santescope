"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

interface PdfDownloadButtonProps {
  communeCode: string;
  communeNom: string;
}

export function PdfDownloadButton({ communeCode, communeNom }: PdfDownloadButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    const el = document.getElementById("pdf-export-root");
    if (!el) return;

    setLoading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#1a1a1a",
        logging: false,
      });
      const link = document.createElement("a");
      link.download = `santescope-${communeCode}-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 bg-white hover:bg-slate-50 hover:border-slate-300 transition-colors disabled:opacity-60 disabled:cursor-not-allowed font-medium"
      title={`Télécharger le diagnostic de ${communeNom}`}
    >
      {loading ? (
        <Loader2 size={15} className="animate-spin shrink-0" />
      ) : (
        <Download size={15} className="shrink-0" />
      )}
      Télécharger le rapport
    </button>
  );
}
