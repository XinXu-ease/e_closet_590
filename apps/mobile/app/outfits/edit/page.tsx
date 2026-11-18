"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import FigmaOutfitDetail from "@/components/FigmaOutfitDetail";
import { FigmaPageStage } from "@/components/FigmaPageStage";

function EditOutfit() {
  const id = useSearchParams().get("id");
  return <FigmaPageStage>{id ? <FigmaOutfitDetail mode="edit" outfitId={id} /> : <p>Outfit not found.</p>}</FigmaPageStage>;
}

export default function EditOutfitPage() {
  return <Suspense fallback={<main className="account-loading">Opening outfit…</main>}><EditOutfit /></Suspense>;
}
