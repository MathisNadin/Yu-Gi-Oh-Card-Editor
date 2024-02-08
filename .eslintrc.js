module.exports = {
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  extends: [
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'plugin:jsx-a11y/recommended',
    'prettier',
    'plugin:prettier/recommended',
  ],
  rules: {
    // A temporary hack related to IDE not resolving correct package.json
    'import/no-extraneous-dependencies': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/jsx-filename-extension': 'off',
    'import/extensions': 'off',
    'import/no-unresolved': 'off',
    'import/no-import-module-exports': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'no-plusplus': 'off',
    'no-await-in-loop': 'off',
    'no-param-reassign': 'off',
    'no-loop-func': 'off',
    'prefer-destructuring': 'off',
    'no-restricted-syntax': 'off',
    'prefer-const': 'off',
    'no-else-return': 'off',
    'prettier/prettier': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'no-unused-vars': 'off',
    'import/prefer-default-export': 'off',
    'class-methods-use-this': 'off',
    'no-undef': 'off',
    'lines-between-class-members': 'off',
    'no-underscore-dangle': 'off',
    'react/prop-types': 'off',
    'react/default-props-match-prop-types': 'off',
    'no-use-before-define': 'off',
    'react/static-property-placement': 'off',
    'react/sort-comp': 'off',
    'react/jsx-uses-react': 'off',
    'jsx-a11y/no-static-element-interactions': 'off',
    'jsx-a11y/click-events-have-key-events': 'off',
    'react/destructuring-assignment': 'off',
    'no-useless-constructor': 'off',
    'react/prefer-stateless-functio': 'off',
    'react/no-array-index-key': 'off',
    'no-return-assign': 'off',
    'react/jsx-props-no-spreading': 'off',
    'no-unreachable': 'off',
    'react/no-unescaped-entities': 'off',
    'import/order': 'off',
    'import/no-dynamic-require': 'off',
    'global-require': 'off',
    'react/self-closing-comp': 'off',
    'react/jsx-curly-brace-presence': 'off',
    'import/first': 'off',
    'no-extra-boolean-cast': 'off',
    'guard-for-in': 'off',
    'func-names': 'off',
    'jsx-a11y/no-noninteractive-element-interactions': 'off',
    'no-control-regex': 'off',
    'no-prototype-builtins': 'off',
    'no-useless-escape': 'off',
    'no-bitwise': 'off',
    'no-shadow': 'off',
    'operator-assignment': 'off',
    'no-continue': 'off',
    'no-void': 'off',
    'no-return-await': 'off',
    'no-nested-ternary': 'off',
    'no-case-declarations': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
