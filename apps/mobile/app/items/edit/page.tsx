"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import FigmaItemDetail from "@/components/FigmaItemDetail";
import { FigmaPageStage } from "@/components/FigmaPageStage";

function EditItem() {
  const id = useSearchParams().get("id");
  return <FigmaPageStage>{id ? <FigmaItemDetail mode="edit" itemId={id} /> : <p>Item not found.</p>}</FigmaPageStage>;
}

export default function EditItemPage() {
  return <Suspense fallback={<main className="account-loading">Opening item…</main>}><EditItem /></Suspense>;
}
