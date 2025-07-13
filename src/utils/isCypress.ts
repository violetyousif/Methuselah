// src/utils/isCypress.ts

/**
 * Returns true if running inside a Cypress test runner.
 * Cypress injects a global `window.Cypress` property during test execution.
 */
export function isCypress(): boolean {
  if (typeof window !== 'undefined' && typeof window.Cypress !== 'undefined') {
    return true;
  }
  return false;
}
