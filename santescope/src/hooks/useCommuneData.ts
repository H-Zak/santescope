"use client";

import { useState, useEffect } from "react";
import { CommuneData } from "@/lib/types";

interface UseCommuneDataResult {
  data: CommuneData | null;
  loading: boolean;
  error: string | null;
}

export function useCommuneData(code: string): UseCommuneDataResult {
  const [data, setData] = useState<CommuneData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) return;

    let cancelled = false;
    setLoading(true);
    setData(null);
    setError(null);

    fetch(`/data/communes/${code}.json`)
      .then((res) => {
        if (res.status === 404) {
          throw new Error(
            "Commune introuvable — le code INSEE est peut-être invalide",
          );
        }
        if (!res.ok) {
          throw new Error("Impossible de charger les données");
        }
        return res.json() as Promise<CommuneData>;
      })
      .then((json) => {
        if (!cancelled) {
          setData(json);
          setLoading(false);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message || "Impossible de charger les données");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [code]);

  return { data, loading, error };
}
