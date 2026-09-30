import FigmaItemDetail from "@/components/FigmaItemDetail";
import { FigmaPageStage } from "@/components/FigmaPageStage";

export default async function ItemDetailPage({
  params,
}: PageProps<"/items/[id]">) {
  const { id } = await params;
  return <FigmaPageStage><FigmaItemDetail mode="edit" itemId={id} /></FigmaPageStage>;
}
