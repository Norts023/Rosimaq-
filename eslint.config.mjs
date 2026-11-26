import js from '@eslint/js';
import eslintPluginAstro from 'eslint-plugin-astro';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', '.astro', 'node_modules', 'test-results', 'playwright-report'] },
  js.configs.recommended,
  ...tseslint.configs.strict,
  ...eslintPluginAstro.configs.recommended,
  {
    languageOptions: { globals: { process: 'readonly' } },
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'error',
    },
  },
);
