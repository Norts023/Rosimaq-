import js from '@eslint/js';
import eslintPluginAstro from 'eslint-plugin-astro';
import tseslint from 'typescript-eslint';

export default [
  { ignores: ['dist', '.astro', 'node_modules', 'test-results', 'playwright-report'] },
  {
    languageOptions: { globals: { process: 'readonly', Buffer: 'readonly', console: 'readonly' } },
  },
  js.configs.recommended,
  ...tseslint.configs.strict,
  ...eslintPluginAstro.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'error',
    },
  },
];
