import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores de eslint-config-next
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Fichiers generes par Cargo/Tauri — binaires non parsables par ESLint
    "src-tauri/**",
  ]),
  {
    // Désactivation des règles du plugin React Compiler (expérimental, non utilisé dans ce projet)
    rules: {
      'react-hooks/react-hooks': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/purity': 'off',
      'react-compiler/react-compiler': 'off',
      // Desactive — genere des faux positifs avec le React Compiler sur le code existant
      'react-hooks/preserve-manual-memoization': 'off',
    },
  },
]);

export default eslintConfig;
