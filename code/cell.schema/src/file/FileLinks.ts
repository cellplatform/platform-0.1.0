/**
 * Helpers for operating on links.
 */
export class FileLinks {
  public static encodeKey = encode;
  public static decodeKey = decode;

  public static toKey(filename: string) {
    const ILLEGAL = ['/', ':'];
    ILLEGAL.forEach(char => {
      if (filename.includes(char)) {
        throw new Error(`File-link key cannot contain "${char}" character.`);
      }
    });

    return `fs:${encode(filename)}`;
  }

  public static toFilename(linksKey: string) {
    linksKey = linksKey.replace(/^fs\:/, '');
    linksKey = shouldDecode(linksKey) ? decode(linksKey) : linksKey;
    return linksKey;
  }

  public static parseLink(value: string) {
    value = (value || '').trim();
    const parts = value.split('?');
    const uri = parts[0];

    let hash = '';
    if (parts[1]) {
      const query = parts[1].split('&').find(item => item.startsWith('hash='));
      if (query) {
        hash = query.replace(/^hash\=/, '');
      }
    }

    return { value, uri, hash };
  }
}

/**
 * [Helpers]
 */

/**
 * Escapes illegal characters from a field key.
 */
function encode(input: string): string {
  input = input.replace(/\./g, ':'); // Period (.) characters are not allowed.
  return input;
}

/**
 * Converts escaped key values back to their original form.
 */
function decode(input: string): string {
  input = input.replace(/\:/g, '.');
  return input;
}
function shouldDecode(input: string) {
  return input.includes(':');
}
