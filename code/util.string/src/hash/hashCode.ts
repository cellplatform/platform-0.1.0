/**
 * Returns a hash code for a string.
 * (Compatible to Java's String.hashCode())
 *
 * Source:
 *   - https://gist.github.com/hyamamoto/fd435505d29ebfa3d9716fd2be8d42f0
 *
 * See also:
 *   - https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
 *
 * The hash code for a string object is computed as
 *
 *     s[0]*31^(n-1) + s[1]*31^(n-2) + ... + s[n-1]
 *
 * using number arithmetic, where s[i] is the i th character
 * of the given string, n is the length of the string,
 * and ^ indicates exponentiation.
 * (The hash value of the empty string is zero.)
 *
 */
export function hashCode(text: string) {
  let hash = 0;
  const length = text.length;
  if (length === 0) {
    return hash;
  }

  let i = 0;
  while (i < length) {
    const chr = text.charCodeAt(i++);
    hash = ((hash << 5) - hash + chr) | 0; // tslint:disable-line
  }
  return hash;
}
