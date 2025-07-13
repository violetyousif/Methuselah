// Violet Yousif, 07/12/2024, Create a Jest setup file for testing a Next.js application with TypeScript and CSS modules support.

// jest.setup.js
import '@testing-library/jest-dom';
import 'whatwg-fetch';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),            // deprecated
    removeListener: jest.fn(),         // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  })),
});
