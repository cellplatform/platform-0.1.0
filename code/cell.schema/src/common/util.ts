/**
 * Determines if the given string is an HTTP link.
 */
export function isHttp(input: string = '') {
  input = input.trim();
  return input.startsWith('https://') || input.startsWith('http://');
}
