import { Metadata } from "next";
import { CommuneView } from "@/components/commune/CommuneView";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  return {
    title: `SanteScope — Commune ${code}`,
  };
}

export default async function CommunePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return <CommuneView code={code} />;
}
