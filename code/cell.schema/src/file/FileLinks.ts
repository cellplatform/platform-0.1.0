import { Uri } from '../uri';

/**
 * Helpers for operating on links.
 */
export class FileLinks {
  public static encodeKey = encode;
  public static decodeKey = decode;

  public static is = {
    fileKey(key?: string) {
      key = (key || '').toString().trim();
      return key.startsWith('fs:');
    },
    fileValue(value?: string) {
      value = (value || '').toString().trim();
      return Uri.is.file(value);
    },
    fileUploading(value?: string) {
      if (!FileLinks.is.fileValue(value)) {
        return false;
      }
      value = (value || '').toString().trim();
      const query = (value.split('?')[1] || '').toLowerCase();
      return query.includes('status=uploading');
    },
  };

  public static toKey(filename: string) {
    return `fs:${encode(filename)}`;
  }

  public static parseKey(linkKey: string) {
    const key = (linkKey || '').trim();
    let path = key.replace(/^fs\:/, '');
    path = shouldDecode(path) ? decode(path) : path;
    const index = path.lastIndexOf('/');
    const name = index < 0 ? path : path.substring(index + 1);
    const dir = index < 0 ? '' : path.substring(0, index);

    return { key, path, name, dir };
  }

  public static parseLink(value: string) {
    if (!FileLinks.is.fileValue(value)) {
      throw new Error(`Cannot parse '${value}' as it is not a file URI.`);
    }

    value = (value || '').trim();
    const parts = value.split('?');
    const uri = parts[0];
    const queries = (parts[1] || '').split('&');

    const get = (key: string, defaultValue?: string) => {
      const item = queries.find(item => item.startsWith(`${key}=`));
      const value = !item ? defaultValue : item.replace(new RegExp(`^${key}\=`), '').trim();
      return typeof value === 'string' && !value ? defaultValue : value;
    };

    const hash = get('hash');
    const status = get('status');

    return {
      value,
      uri,
      hash,
      status,
      toString(args: { hash?: string | null; status?: string | null } = {}) {
        let query = '';
        const add = (key: string, value?: string | null) => {
          if (value && value !== null) {
            query = !query ? `?` : query;
            query = !query.endsWith('?') ? `${query}&` : query;
            query = `${query}${key}=${value}`;
          }
        };
        add('status', args.status === null ? null : args.status || status);
        add('hash', args.hash === null ? null : args.hash || hash);
        return `${uri.trim()}${query}`;
      },
    };
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
  input = trimSlashes(input);

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

function trimSlashes(input: string) {
  return (input || '').replace(/^\/*/, '').replace(/\/*$/, '');
}
