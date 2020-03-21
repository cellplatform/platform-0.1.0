import { t, queryString } from '../common';
import { Uri } from '../Uri';
import { Links } from '../Links';

const prefix = 'ref';
const ref = Links.create(prefix);

/**
 * Helpers for operating on [ref] links,
 * aka. links to other namespaces/sheets, cells, columns or rows.
 */
export class RefLinks {
  public static prefix = prefix;

  public static is = {
    refKey(input?: string) {
      return ref.isKey(input);
    },
    refValue(input?: string) {
      input = (input || '').toString().trim();
      const uri = Uri.parse(input);
      return ['NS', 'CELL', 'ROW', 'COLUMN'].includes(uri.type);
    },
  };

  public static total(links: t.IUriMap = {}) {
    return ref.total(links);
  }

  public static toKey(linkName: string) {
    return ref.toKey(linkName);
  }

  public static parseKey(linkKey: string) {
    return ref.parseKey(linkKey);
  }

  public static parseValue(linkValue: string) {
    if (!RefLinks.is.refValue(linkValue)) {
      throw new Error(`Cannot parse '${linkValue}' as it is not a supported URI type.`);
    }
    const res = ref.parseValue<t.IRefLinkUri, t.IRefLinkQuery>(linkValue);
    const toString: t.RefLinkToString = (options = {}) => {
      const { hash } = res.query;
      const query = queryString
        .build({ allowNil: false })
        .add('hash', options.hash === null ? null : options.hash || hash)
        .toString();
      return `${res.uri.toString()}${query}`;
    };
    return { ...res, toString };
  }

  public static parse(linkKey: string, linkValue: string): t.IRefLink {
    const key = RefLinks.parseKey(linkKey);
    const value = RefLinks.parseValue(linkValue);
    const toString = value.toString;
    return { ...key, ...value, toString };
  }

  public static toValue(uri: t.IUri, options: { hash?: string } = {}) {
    const query = queryString
      .build({ allowNil: false })
      .add('hash', options.hash)
      .toString();
    return `${uri.toString()}${query}`;
  }

  /**
   * Converts a links URI map into a list of parsed link-refs.
   */
  public static toList(links: t.IUriMap = {}) {
    return ref.toList(links).map(({ key, value }) => RefLinks.parse(key, value));
  }

  /**
   * Lookup a file on the given links.
   */
  public static find(links: t.IUriMap = {}) {
    return {
      byName(path?: string) {
        const match = ref.find(links).byName(path);
        return match ? RefLinks.parse(match.key, match.value) : undefined;
      },
    };
  }
}
