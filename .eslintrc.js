module.exports = {
  root: true,
  extends: ['@soloadvertiser/eslint-config/base'],
  parserOptions: {
    project: './tsconfig.json',
  },
  ignorePatterns: ['node_modules', 'dist', '.next', 'coverage'],
};
