import { t, QueryString, wildcard } from '../common';
import { Uri } from '../Uri';
import { KeyEncoding } from '../Encoding/Encoding.Key';

type ILinksArgs = { prefix: string };

/**
 * Helpers for operating on links
 */
export class Links {
  public static encodeKey = KeyEncoding.escape;
  public static decodeKey = KeyEncoding.unescape;

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
    return `${prefix}:${KeyEncoding.escape(input)}`;
  }

  /**
   * Converts a links URI map into a list of parsed file refs.
   */
  public toList(links: t.IUriMap = {}) {
    return Links.toList(this.prefix, links);
  }
  public static toList(prefix: string, links: t.IUriMap = {}) {
    return Object.keys(links)
      .map((key) => ({ key, value: links[key] }))
      .filter(({ key }) => Links.isKey(prefix, key))
      .map(({ key, value }) => ({ key, value }));
  }

  /**
   * Parse a key of a cell's [links] object-map into it's constituent parts.
   */
  public parseKey(linkKey: string): t.ILinkKey {
    return Links.parseKey(this.prefix, linkKey);
  }
  public static parseKey(prefix: string, linkKey: string): t.ILinkKey {
    const key = (linkKey || '').trim();
    let path = key.replace(new RegExp(`^${prefix}:`), '');
    path = shouldDecode(path) ? Links.decodeKey(path) : path;
    const lastSlash = path.lastIndexOf('/');
    const name = lastSlash < 0 ? path : path.substring(lastSlash + 1);
    const dir = lastSlash < 0 ? '' : path.substring(0, lastSlash);

    const lastPeriod = name.lastIndexOf('.');
    const ext = lastPeriod < 0 ? '' : name.substring(lastPeriod + 1);

    const res: t.ILinkKey = { prefix, key, path, name, dir, ext };
    return res;
  }

  /**
   * Parse a value of a cell's [links] object-map into it's constituent parts.
   */
  public parseValue<U extends t.IUri = t.IUri, Q extends t.ILinkQuery = t.ILinkQuery>(
    linkValue: string,
  ): t.ILinkValue<U, Q> {
    return Links.parseValue<U, Q>(linkValue);
  }
  public static parseValue<U extends t.IUri = t.IUri, Q extends t.ILinkQuery = t.ILinkQuery>(
    linkValue: string,
  ): t.ILinkValue<U, Q> {
    const parts = (linkValue || '')
      .trim()
      .split('?')
      .map((part) => part.trim());
    const uri = Uri.parse<U>(parts[0] || '').parts;
    const query = QueryString.toObject<Q>(parts[1]);
    const value = parts.join('?').replace(/\?$/, '');
    const res: t.ILinkValue<U, Q> = { value, uri, query };
    return res;
  }

  /**
   * Parse the key/value of a link into an object.
   */
  public parse<U extends t.IUri = t.IUri, Q extends t.ILinkQuery = t.ILinkQuery>(
    linkKey: string,
    linkValue: string,
  ): t.ILink<U, Q> {
    return Links.parseLink<U, Q>(this.prefix, linkKey, linkValue);
  }
  public static parseLink<U extends t.IUri = t.IUri, Q extends t.ILinkQuery = t.ILinkQuery>(
    prefix: string,
    linkKey: string,
    linkValue: string,
  ): t.ILink<U, Q> {
    const key = Links.parseKey(prefix, linkKey);
    const value = Links.parseValue<U, Q>(linkValue);
    return { ...key, ...value };
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
          .map((key) => ({ key, value: links[key] }))
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

function shouldDecode(input: string) {
  return input.includes(':');
}
