import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  // Development identifier. Confirm this is available in your Apple Developer
  // account before TestFlight or App Store distribution.
  appId: "com.xin.ecloset",
  appName: "E-Closet",
  webDir: "out",
  ios: {
    // Let the web layer paint the full display. CSS then reserves the actual
    // safe-area insets for controls, avoiding white native gutters.
    contentInset: "never",
  },
};

export default config;
