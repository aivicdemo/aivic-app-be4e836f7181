import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e",
  use: { baseURL: process.env.PLAYWRIGHT_BASE_URL || "https://dev.d3r3rai463jny7.amplifyapp.com" },
  workers: process.env.CI ? 6 : undefined,
  timeout: 30_000,
  reporter: "list",
});
