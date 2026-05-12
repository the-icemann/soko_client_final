import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import prettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import prettierPlugin from "eslint-plugin-prettier";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import tseslint from "typescript-eslint";

export default defineConfig([
  { ignores: ["dist", "dev-dist", "node_modules", ".tanstack"] },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ["vite.config.js"],
    languageOptions: {
      globals: {
        __dirname: "readonly",
        __filename: "readonly",
        process: "readonly",
      },
    },
  },

  {
    plugins: {
      "simple-import-sort": simpleImportSort,
      import: importPlugin,
      prettier: prettierPlugin,
    },

    rules: {
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      "import/first": "error",
      "import/newline-after-import": "error",
      "import/no-duplicates": "error",

      "no-multiple-empty-lines": ["error", { max: 1, maxEOF: 0 }],
      "eol-last": ["error", "always"],
      "no-trailing-spaces": "error",

      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/ban-ts-comment": "off",

      "prettier/prettier": "error",
    },
  },

  prettier,
]);
