import { AppShell } from "@/components/AppShell";
import { AddItemScreen } from "@/components/Screens";

export default function AddItemPage() {
  return <AppShell showNavigation={false}><AddItemScreen /></AppShell>;
}
