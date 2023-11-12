module.exports = {
  extends: 'erb',
  rules: {
    // A temporary hack related to IDE not resolving correct package.json
    'import/no-extraneous-dependencies': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/jsx-filename-extension': 'off',
    'import/extensions': 'off',
    'import/no-unresolved': 'off',
    'import/no-import-module-exports': 'off',
    'no-plusplus': 'off',
    'no-await-in-loop': 'off',
    'no-param-reassign': 'off',
    'no-loop-func': 'off',
    'prefer-destructuring': 'off',
    'no-restricted-syntax': 'off',
    'prefer-const': 'off',
    'no-else-return': 'off',
    'prettier/prettier': 'off',
    'no-unused-vars': 'off',
    'import/prefer-default-export': 'off',
    'class-methods-use-this': 'off',
    'no-undef': 'off',
    'lines-between-class-members': 'off',
    'no-underscore-dangle': 'off',
    'react/default-props-match-prop-types': 'off',
    'no-use-before-define': 'off',
    'react/static-property-placement': 'off',
    'react/sort-comp': 'off',
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
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    createDefaultProgram: true,
  },
  settings: {
    'import/resolver': {
      // See https://github.com/benmosher/eslint-plugin-import/issues/1396#issuecomment-575727774 for line below
      node: {},
      webpack: {
        config: require.resolve('./.erb/configs/webpack.config.eslint.ts'),
      },
      typescript: {},
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
  },
};
