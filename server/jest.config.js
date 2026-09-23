export default {
  testEnvironment: "node",
  coverageProvider: "v8",
  testMatch: ["<rootDir>/tests/jest/**/*.test.js"],
  collectCoverageFrom: ["<rootDir>/src/**/*.js"],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
};
