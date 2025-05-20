import { FlatCompat } from "@eslint/eslintrc";
import * as tseslint from "@typescript-eslint/eslint-plugin";
// @ts-ignore -- no types for this plugin
import drizzle from "eslint-plugin-drizzle";

const compat = new FlatCompat();

export default [
  {
    ignores: ["**/node_modules/**", ".next/**", "dist/**"],
  },
  ...compat.extends("next/core-web-vitals"),
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      "@typescript-eslint": tseslint,
      drizzle: drizzle,
    },
    rules: {
      "drizzle/enforce-delete-with-where": ["error"],
      "drizzle/enforce-update-with-where": ["error"],
    },
  },
];
