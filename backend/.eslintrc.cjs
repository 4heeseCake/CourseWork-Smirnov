module.exports = {
  env: {
    node: true,
    es2022: true,
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  overrides: [
    {
      files: ['tests/**/*.js'],
      env: {
        node: true,
        es2022: true,
      },
      globals: {
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
      },
    },
  ],
};
