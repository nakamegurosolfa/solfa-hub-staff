import tsconfigPaths from "vite-tsconfig-paths";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    env: {
      TZ: "UTC",
    },
    exclude: [...configDefaults.exclude, "src/routes/**/*.test.tsx"],
  },
});
