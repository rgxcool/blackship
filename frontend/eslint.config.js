import js from "@eslint/js";
import tseslint from "typescript-eslint";
import boundaries from "eslint-plugin-boundaries";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { boundaries },
    settings: {
      "boundaries/elements": [
        { type: "app", pattern: "src/app/*" },
        { type: "pages", pattern: "src/pages/*" },
        { type: "shared", pattern: "src/shared/*" },
      ],
      "boundaries/include": ["src/**/*"],
    },
    rules: {
      "boundaries/element-types": [
        "error",
        {
          default: "disallow",
          rules: [
            { from: "app", allow: ["pages", "shared"] },
            { from: "pages", allow: ["shared"] },
            { from: "shared", allow: ["shared"] },
          ],
        },
      ],
      "boundaries/no-unknown": "error",
    },
  },
  {
    ignores: ["dist/**", "node_modules/**", "e2e/**"],
  },
);
