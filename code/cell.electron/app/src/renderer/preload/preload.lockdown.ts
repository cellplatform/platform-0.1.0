/**
 * Lock down the JS environment.
 */
export function lockdown() {
  // Prevent new windows being opened within scripts.
  window.open = (url?: string, target?: string, features?: string, replace?: boolean) => null;
}
