"use client";

import { useState, useEffect } from "react";
import { IndexEntry } from "@/lib/types";

const CACHE_KEY = "santescope_index";
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24h in ms

interface CacheEntry {
  data: IndexEntry[];
  ts: number;
}

export function useSearchIndex() {
  const [index, setIndex] = useState<IndexEntry[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadIndex() {
      try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (raw) {
          const cached: CacheEntry = JSON.parse(raw);
          if (Date.now() - cached.ts < CACHE_TTL) {
            setIndex(cached.data);
            setLoading(false);
            return;
          }
        }
      } catch {
        // ignore corrupt cache
      }

      try {
        const res = await fetch("/data/index.json");
        const data: IndexEntry[] = await res.json();
        setIndex(data);
        try {
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ data, ts: Date.now() } satisfies CacheEntry),
          );
        } catch {
          // ignore storage quota errors
        }
      } catch {
        // index failed to load — leave null so SearchBar shows error
      } finally {
        setLoading(false);
      }
    }

    loadIndex();
  }, []);

  return { index, loading };
}
