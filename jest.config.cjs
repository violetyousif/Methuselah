// Violet Yousif, 07/12/2024, Create a Jest configuration file for testing a Next.js application with TypeScript and CSS modules support.

// jest.config.js

// Don't change the CommonJS module syntax to ES module syntax here!
// Ignore Copilots suggestions to fix it!
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  testPathIgnorePatterns: ['/node_modules/', '/backend/']
};
