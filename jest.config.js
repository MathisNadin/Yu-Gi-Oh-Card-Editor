/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {}],
  },
  modulePathIgnorePatterns: [
    '<rootDir>/.build-web',
    '<rootDir>/.temp-desktop',
    '<rootDir>/.build-desktop',
    '<rootDir>/.package-desktop',
  ],
  transformIgnorePatterns: ['node_modules'],
  testMatch: ['**/tests/**/*.test.[jt]s?(x)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
};
