/**
 * Helpers for operating on links.
 */
export class FileLinks {
  public static encodeKey = encode;
  public static decodeKey = decode;

  public static toKey(filename: string) {
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
  const ILLEGAL = [':'];
  ILLEGAL.forEach(char => {
    if (input.includes(char)) {
      throw new Error(`File-link key cannot contain "${char}" character.`);
    }
  });

  // Trim surrounding "/" characters.
  input = input.replace(/^\/*/, '').replace(/\/*$/, '');

  // Special escaping multi-period characters (".." => "[..]").
  const escapeMultiPeriods = (input: string): string => {
    const regex = new RegExp(/\.{2,}/g);
    const match = regex.exec(input);
    if (match && match[0]) {
      const left = input.substring(0, match.index);
      const middle = ':'.repeat(match[0].length);
      const right = input.substring(match.index + match[0].length);
      input = `${left}[${middle}]${right}`;
      return escapeMultiPeriods(input); // <== RECURSION 🌳
    } else {
      return input;
    }
  };

  input = escapeMultiPeriods(input)
    .replace(/\//g, '::') // Path seperator (/) characters escaped.
    .replace(/\./g, ':'); // Single period (.) characters escaped.
  return input;
}

/**
 * Converts escaped key values back to their original form.
 */
function decode(input: string): string {
  // Unescape the special multi-period escaping ("[..]" => "..").
  const unescapeMultiPeriods = (input: string): string => {
    const regex = new RegExp(/\[:{2,}\]/g);
    const match = regex.exec(input);
    if (match && match[0]) {
      const left = input.substring(0, match.index);
      const middle = '.'.repeat(match[0].length - 2);
      const right = input.substring(match.index + match[0].length);
      input = `${left}${middle}${right}`;
      return unescapeMultiPeriods(input); // <== RECURSION 🌳
    } else {
      return input;
    }
  };

  // Replace escaped characters.
  input = unescapeMultiPeriods(input)
    .replace(/::/g, '/') // Path seperator (/) characters escaped.
    .replace(/:/g, '.'); // Single period (.) characters escaped.
  return input;
}
function shouldDecode(input: string) {
  return input.includes(':');
}
