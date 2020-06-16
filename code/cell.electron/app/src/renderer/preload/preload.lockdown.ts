/**
 * Lock down the JS environment removing any methods on [window]
 * that may be potential security holes.
 */
export function lockdown() {
  // Prevent new windows being opened within scripts.
  window.open = (url?: string, target?: string, features?: string, replace?: boolean) => null;
}
