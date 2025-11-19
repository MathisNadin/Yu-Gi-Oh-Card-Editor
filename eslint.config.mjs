// eslint.config.mjs
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import prettierPlugin from 'eslint-plugin-prettier';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';

export default [
  // -------- IGNORE --------
  {
    ignores: ['.eslintrc.js', '**/*.json', 'webpack/**/*.js', 'webpack/**/*.mjs', 'node_modules', 'dist', 'build'],
  },

  // -------- Base JS --------
  js.configs.recommended,

  // -------- TypeScript + React/JSX --------
  ...tseslint.configs.recommendedTypeChecked.map((config) => ({
    ...config,
    files: ['source/**/*.{ts,tsx}', 'webpack/**/*.{ts,tsx}'],
    languageOptions: {
      ...config.languageOptions,
      parserOptions: {
        ...config.languageOptions?.parserOptions,
        project: './tsconfig.json',
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: {
          ...(config.languageOptions?.parserOptions?.ecmaFeatures ?? {}),
          jsx: true,
        },
      },
    },
    plugins: {
      ...(config.plugins ?? {}),
      '@typescript-eslint': tseslint.plugin,
      import: importPlugin,
      prettier: prettierPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'jsx-a11y': jsxA11yPlugin,
    },
    rules: {
      ...(config.rules ?? {}),

      // React Hooks recommended
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // ----- CUSTOM RULES -----
      // import
      'import/no-extraneous-dependencies': 'off',
      'import/extensions': 'off',
      'import/no-unresolved': 'off',
      'import/no-import-module-exports': 'off',
      'import/prefer-default-export': 'off',
      'import/order': 'off',
      'import/no-dynamic-require': 'off',
      'import/first': 'off',

      // React
      'react/react-in-jsx-scope': 'off',
      'react/jsx-filename-extension': 'off',
      'react/prop-types': 'off',
      'react/default-props-match-prop-types': 'off',
      'react/static-property-placement': 'off',
      'react/sort-comp': 'off',
      'react/jsx-uses-react': 'off',
      'react/destructuring-assignment': 'off',
      'react/prefer-stateless-function': 'off',
      'react/no-array-index-key': 'off',
      'react/jsx-props-no-spreading': 'off',
      'react/self-closing-comp': 'off',
      'react/jsx-curly-brace-presence': 'off',
      'react/no-unescaped-entities': 'off',

      // JSX a11y
      'jsx-a11y/no-static-element-interactions': 'off',
      'jsx-a11y/click-events-have-key-events': 'off',
      'jsx-a11y/no-noninteractive-element-interactions': 'off',

      // TypeScript
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-deprecated': 'warn',

      // GENERIC JS
      'no-unused-vars': ['off', { argsIgnorePattern: '^_' }],
      'no-plusplus': 'off',
      'no-await-in-loop': 'off',
      'no-param-reassign': 'off',
      'no-loop-func': 'off',
      'prefer-destructuring': 'off',
      'no-restricted-syntax': 'off',
      'prefer-const': 'off',
      'no-else-return': 'off',
      'prettier/prettier': 'off',
      'class-methods-use-this': 'off',
      'no-undef': 'off',
      'lines-between-class-members': 'off',
      'no-underscore-dangle': 'off',
      'no-use-before-define': 'off',
      'no-useless-constructor': 'off',
      'no-return-assign': 'off',
      'no-unreachable': 'off',
      'no-extra-boolean-cast': 'off',
      'guard-for-in': 'off',
      'func-names': 'off',
      'no-control-regex': 'off',
      'no-prototype-builtins': 'off',
      'no-useless-escape': 'off',
      'no-bitwise': 'off',
      'no-shadow': 'off',
      'operator-assignment': 'off',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-void': 'off',
      'no-return-await': 'off',
      'no-nested-ternary': 'off',
      'no-case-declarations': 'off',
      'global-require': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  })),

  // -------- OVERRIDES --------
  {
    files: ['**/package.json', 'source/api/main.json'],
    rules: {
      '@typescript-eslint/no-unused-expressions': 'off',
    },
  },
];
