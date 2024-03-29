module.exports = {
  extends: [
    'react-app',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'prettier/@typescript-eslint',
  ],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json'],
  },
  parser: '@typescript-eslint/parser',
  plugins: ['prettier', '@emotion'],
  rules: {
    'react/react-in-jsx-scope': 0,
    'prettier/prettier': 'warn',
    '@emotion/jsx-import': 'error',

    // I want to use type inference
    '@typescript-eslint/explicit-module-boundary-types': 0,
  },
  overrides: [
    {
      files: ['**/.eslintrc.js'],
      parser: 'babel-eslint',
    },
  ],
}
