import { Metadata } from "next";
import { CompareView } from "@/components/compare/CompareView";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ a: string; b: string }>;
}): Promise<Metadata> {
  const { a, b } = await params;
  return {
    title: `SanteScope — Comparaison ${a} vs ${b}`,
  };
}

export default async function ComparerPage({
  params,
}: {
  params: Promise<{ a: string; b: string }>;
}) {
  const { a, b } = await params;
  return <CompareView codeA={a} codeB={b} />;
}
