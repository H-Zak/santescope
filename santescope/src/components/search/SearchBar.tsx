"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchIndex } from "@/hooks/useSearchIndex";
import { filterIndex } from "@/lib/search";
import { DPE_COLORS, DPE_TEXT_COLORS } from "@/lib/constants";
import { IndexEntry } from "@/lib/types";

interface SearchBarProps {
  fullScreen?: boolean;
}

function ScoreBadge({ classe }: { classe: string | null }) {
  if (!classe) {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 20,
          height: 16,
          borderRadius: 3,
          background: "#CBD5E1",
          color: "#475569",
          fontSize: 9,
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        –
      </span>
    );
  }
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 20,
        height: 16,
        borderRadius: 3,
        background: DPE_COLORS[classe] ?? "#CBD5E1",
        color: DPE_TEXT_COLORS[classe] ?? "#FFFFFF",
        fontSize: 9,
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {classe}
    </span>
  );
}

export function SearchBar({ fullScreen = false }: SearchBarProps) {
  const router = useRouter();
  const { index, loading } = useSearchIndex();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<IndexEntry[]>([]);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleChange = useCallback(
    (value: string) => {
      setQuery(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        if (!index || !value.trim()) {
          setResults([]);
          setOpen(false);
          return;
        }
        const filtered = filterIndex(index, value);
        setResults(filtered);
        setOpen(true);
        setHighlighted(-1);
      }, 150);
    },
    [index]
  );

  const selectEntry = useCallback(
    (entry: IndexEntry) => {
      setOpen(false);
      setQuery(entry.nom);
      router.push(`/commune/${entry.code}`);
    },
    [router]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter" && highlighted >= 0) {
      e.preventDefault();
      selectEntry(results[highlighted]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className={fullScreen ? "w-full max-w-xl" : "w-64"}>
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    );
  }

  const inputClass = fullScreen
    ? "w-full max-w-xl"
    : "w-64";

  return (
    <div className={`relative ${inputClass}`}>
      <div
        className="flex items-center bg-white border-2 rounded-xl px-4 h-12 gap-3 transition-colors shadow-sm focus-within:border-[#0F766E] border-slate-200"
        style={{ boxShadow: fullScreen ? "0 4px 24px rgba(15,118,110,0.08)" : undefined }}
      >
        <Search size={18} className="text-slate-400 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Rechercher une commune..."
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) setOpen(true);
          }}
          className="flex-1 bg-transparent outline-none text-sm text-slate-800 placeholder:text-slate-400"
        />
      </div>

      {open && (
        <div
          ref={dropdownRef}
          className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-50"
        >
          {results.length === 0 && query.length > 0 ? (
            <div className="px-4 py-3 text-sm text-slate-500">
              Aucune commune trouvée — vérifiez le nom ou le code INSEE
            </div>
          ) : (
            results.map((entry, i) => (
              <div
                key={entry.code}
                onMouseDown={() => selectEntry(entry)}
                onMouseEnter={() => setHighlighted(i)}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                  i < results.length - 1 ? "border-b border-slate-100" : ""
                } ${highlighted === i ? "bg-[#f0fdf4]" : "hover:bg-[#f8fafc]"}`}
              >
                <ScoreBadge classe={entry.classe} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-800 truncate">
                    {entry.nom}
                  </div>
                  <div className="text-xs text-slate-400">
                    Dép. {entry.dept} · {entry.pop.toLocaleString("fr-FR")} hab.
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
