import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import unicorn from "eslint-plugin-unicorn";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  ...tseslint.config(
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
      files: ["**/*.{ts,tsx}"],
      languageOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        globals: {
          ...globals.browser,
        },
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
        },
      },
      plugins: {
        react,
        "react-hooks": reactHooks,
        "jsx-a11y": jsxA11y,
      },
      settings: {
        react: {
          version: "detect",
        },
      },
      rules: {
        ...react.configs.recommended.rules,
        ...reactHooks.configs.recommended.rules,
        ...jsxA11y.configs.recommended.rules,
      },
    }
  ),
  unicorn.configs["flat/recommended"],
  {
    rules: {
      "unicorn/filename-case": "off",
      "unicorn/prefer-query-selector": "off",
      "unicorn/no-null": "off",
      "unicorn/prevent-abbreviations": ["error", { allowList: { env: true } }],
    },
  },
  eslintConfigPrettier,
];
