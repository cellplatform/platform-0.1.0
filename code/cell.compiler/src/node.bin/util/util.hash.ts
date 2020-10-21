/**
 * Based on: https://stackoverflow.com/a/8831937
 */
export function toHash(text: string) {
  if (text.length == 0) {
    return '';
  } else {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer.
    }
    return hash.toString();
  }
}
