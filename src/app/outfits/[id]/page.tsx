import FigmaOutfitDetail from "@/components/FigmaOutfitDetail";
import { FigmaPageStage } from "@/components/FigmaPageStage";

export default async function OutfitDetailPage({
  params,
}: PageProps<"/outfits/[id]">) {
  const { id } = await params;
  return <FigmaPageStage><FigmaOutfitDetail mode="edit" outfitId={id} /></FigmaPageStage>;
}
