module.exports = {
  testEnvironment: 'node',
  collectCoverage: true,
  coverageReporters: ['text', 'lcov', 'clover', 'html'],
  coverageDirectory: '<rootDir>/coverage',
  testTimeout: 10000,
  modulePathIgnorePatterns: ['node_modules'],
  roots: ['<rootDir>/tests']
};
