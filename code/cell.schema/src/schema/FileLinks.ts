/**
 * Helpers for operating on links.
 */
export class FileLinks {
  public static encodeKey = encode;
  public static decodeKey = decode;

  public static toKey(filename: string) {
    if (filename.includes('/')) {
      throw new Error(`File link key cannot contain "/" character.`);
    }
    return `fs/${encode(filename)}`;
  }

  public static toFilename(linksKey: string) {
    linksKey = shouldDecode(linksKey) ? decode(linksKey) : linksKey;
    return linksKey.replace(/^fs\//, '');
  }
}

/**
 * [Helpers]
 */

/**
 * Escapes illegal characters from a field key.
 */
function encode(input: string): string {
  input = input.replace(/\./g, '\\'); // Period (.) characters are not allowed.
  return input;
}

/**
 * Converts escaped key values back to their original form.
 */
function decode(input: string): string {
  input = input.replace(/\\/g, '.');
  return input;
}
function shouldDecode(input: string) {
  return input.includes('\\');
}
