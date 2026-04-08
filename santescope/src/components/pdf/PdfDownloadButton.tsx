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
      style={{
        padding: "6px 14px", borderRadius: 8, border: "none",
        background: "#0F766E", cursor: loading ? "not-allowed" : "pointer",
        fontSize: 12, color: "#fff", fontWeight: 600, fontFamily: "inherit",
        display: "flex", alignItems: "center", gap: 5, opacity: loading ? 0.6 : 1,
      }}
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
