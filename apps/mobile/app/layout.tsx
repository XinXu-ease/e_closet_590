import type { Metadata, Viewport } from "next";
import { AccountProvider } from "@/components/AccountProvider";
import "@fontsource/old-standard-tt/400.css";
import "@fontsource/old-standard-tt/700.css";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "E-Wardrobe",
  description: "A digital fashion scrapbook and personal wardrobe journal.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f5f2ea",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><AccountProvider>{children}</AccountProvider></body></html>;
}
