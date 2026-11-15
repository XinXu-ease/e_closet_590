import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: false,
  workers: 1,
  use: { baseURL: "http://127.0.0.1:3100", viewport: { width: 402, height: 874 }, headless: true, channel: process.env.PLAYWRIGHT_CHANNEL || "chrome" },
  reporter: "list",
  outputDir: ".artifacts/playwright",
});
