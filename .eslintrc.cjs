/**
 * Zentrales ESLint Config für Monorepo
 * - Basis: TypeScript + Recommended
 * - React Overrides für client
 * - NestJS spezifische Lockerungen für server
 */
module.exports = {
  root: true,
  ignorePatterns: ['dist', 'node_modules'],
  env: { es2021: true, node: true, browser: true },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  plugins: ['@typescript-eslint', 'react-refresh'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  settings: {
    react: { version: 'detect' },
  },
  overrides: [
    {
      files: ['apps/client/**/*.{ts,tsx}'],
      plugins: ['react', 'react-hooks'],
      extends: ['plugin:react/recommended', 'plugin:react-hooks/recommended'],
      rules: {
        'react/react-in-jsx-scope': 'off',
        'react/prop-types': 'off',
      },
    },
    {
      files: ['apps/server/src/**/*.ts'],
      rules: {
        '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      },
    },
  ],
  rules: {
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
};
