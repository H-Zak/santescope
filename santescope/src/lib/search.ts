import { IndexEntry } from "@/lib/types";

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

export function filterIndex(index: IndexEntry[], query: string): IndexEntry[] {
  if (!query.trim()) return [];

  const q = normalize(query);
  const starts: IndexEntry[] = [];
  const includes: IndexEntry[] = [];

  for (const entry of index) {
    if (starts.length + includes.length >= 8) break;

    const nom = normalize(entry.nom);

    if (nom.startsWith(q) || entry.code.startsWith(query)) {
      starts.push(entry);
    } else if (nom.includes(q)) {
      includes.push(entry);
    }
  }

  return [...starts, ...includes].slice(0, 8);
}
