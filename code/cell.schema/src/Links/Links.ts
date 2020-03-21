import { t, queryString, wildcard } from '../common';
import { Uri } from '../Uri';

type ILinksArgs = { prefix: string };
type Query = { [key: string]: string | boolean | undefined };

/**
 * Helpers for operating on links
 */
export class Links {
  public static encodeKey = encode;
  public static decodeKey = decode;

  /**
   * [Lifecycle]
   */
  public static create = (prefix: string) => new Links({ prefix });
  private constructor(args: ILinksArgs) {
    this.prefix = args.prefix;
  }

  /**
   * [Fields]
   */
  public readonly prefix: string;

  /**
   * [Methods]
   */

  /**
   * Determine if the given value starts with the current link-prefix.
   */
  public isKey(input?: string) {
    return Links.isKey(this.prefix, input);
  }
  public static isKey(prefix: string, input?: string) {
    input = (input || '').toString().trim();
    return input.startsWith(prefix);
  }

  /**
   * Counts the total number of entries that match the current link-prefix.
   */
  public total(links: t.IUriMap = {}) {
    return Links.total(this.prefix, links);
  }
  public static total(prefix: string, links: t.IUriMap = {}) {
    return Object.keys(links).reduce((acc, next) => {
      return Links.isKey(prefix, next) ? acc + 1 : acc;
    }, 0);
  }

  /**
   * Generate an encoded (safe) key for the cell's [links] object-map.
   */
  public toKey(input: string) {
    return Links.toKey(this.prefix, input);
  }
  public static toKey(prefix: string, input: string) {
    input = (input || '').trim();
    if (!input) {
      throw new Error(`Link key must have a value.`);
    }
    prefix = (prefix || '').trim().replace(/:*$/, '');
    return `${prefix}:${encode(input)}`;
  }

  /**
   * Converts a links URI map into a list of parsed file refs.
   */
  public toList(links: t.IUriMap = {}) {
    return Links.toList(this.prefix, links);
  }
  public static toList(prefix: string, links: t.IUriMap = {}) {
    return Object.keys(links)
      .map(key => ({ key, value: links[key] }))
      .filter(({ key }) => Links.isKey(prefix, key))
      .map(({ key, value }) => ({ key, value }));
  }

  /**
   * Parse a key of a cell's [links] object-map into it's constituent parts.
   */
  public parseKey(linkKey: string) {
    return Links.parseKey(this.prefix, linkKey);
  }
  public static parseKey(prefix: string, linkKey: string) {
    const key = (linkKey || '').trim();
    let path = key.replace(new RegExp(`^${prefix}\:`), '');
    path = shouldDecode(path) ? Links.decodeKey(path) : path;
    const lastSlash = path.lastIndexOf('/');
    const lastPeriod = path.lastIndexOf('.');
    const name = lastSlash < 0 ? path : path.substring(lastSlash + 1);
    const dir = lastSlash < 0 ? '' : path.substring(0, lastSlash);
    const ext = lastPeriod < 0 ? '' : path.substring(lastPeriod + 1);
    return { key, path, name, dir, ext };
  }

  /**
   * Parse a value of a cell's [links] object-map into it's constituent parts.
   */
  public parseValue<U extends t.IUri = t.IUri, Q extends Query = Query>(linkValue: string) {
    return Links.parseValue<U, Q>(linkValue);
  }
  public static parseValue<U extends t.IUri = t.IUri, Q extends Query = Query>(linkValue: string) {
    const parts = (linkValue || '')
      .trim()
      .split('?')
      .map(part => part.trim());
    const uri = Uri.parse<U>(parts[0] || '').parts;
    const query = queryString.toObject<Q>(parts[1]);
    const value = parts.join('?').replace(/\?$/, '');
    return { value, uri, query };
  }

  /**
   * Lookup an item on the given links.
   */
  public find(links: t.IUriMap = {}) {
    return Links.find(this.prefix, links);
  }
  public static find(prefix: string, links: t.IUriMap = {}) {
    return {
      byName(path?: string) {
        path = (path || '').trim().replace(/^\/*/, '');
        return Object.keys(links)
          .map(key => ({ key, value: links[key] }))
          .filter(({ key }) => Links.isKey(prefix, key))
          .find(({ key }) => {
            const parsed = Links.parseKey(prefix, key);
            return (path || '').includes('*')
              ? wildcard.isMatch(parsed.path, path)
              : parsed.path === path;
          });
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
      throw new Error(`Link key cannot contain "${char}" character.`);
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
