module.exports = {
  env: {
    browser: true,
    es2022: true,
  },
  extends: ['eslint:recommended', 'plugin:react-hooks/recommended'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['react-hooks', 'react'],
  rules: { 'react/jsx-uses-vars': 'error', 'react/jsx-uses-react': 'error' },
  globals: {
    React: 'readonly',
  },
  overrides: [
    {
      files: ['tests/**/*.{js,jsx}'],
      env: {
        browser: true,
        es2022: true,
      },
      globals: {
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
      },
    },
  ],
};
