import Link from "next/link";

export default async function CommunePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  return (
    <div className="p-8">
      <p className="text-slate-600">Commune {code}</p>
      <Link href="/" className="text-[#0F766E] underline mt-4 block">
        ← Retour à la recherche
      </Link>
    </div>
  );
}
