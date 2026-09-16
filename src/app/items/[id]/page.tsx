import { AppShell } from "@/components/AppShell";
import { ItemDetailScreen } from "@/components/Screens";

export default function ItemDetailPage() {
  return <AppShell showNavigation={false}><ItemDetailScreen /></AppShell>;
}
