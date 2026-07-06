import { defineConfig, globalIgnores } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  // Keep the starter on the flat config export that actually runs under the pinned ESLint/Next toolchain.
  ...nextCoreWebVitals,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
  {
    // This rule flags any setState inside an effect, including mount-time
    // fetch-then-set (a documented valid use case). Disable it for components
    // whose only effects are initial data loading.
    files: [
      "src/app/page.tsx",
      "src/components/NotesScreen.tsx",
      "src/components/launcher/FakeLauncher.tsx",
      "src/components/main/MainMenu.tsx",
      "src/components/main/EditList.tsx",
      "src/components/main/SelectForceItem.tsx",
      "src/components/main/Settings.tsx",
    ],
    rules: {
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);
