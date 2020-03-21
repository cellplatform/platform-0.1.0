import { t, queryString } from '../common';
import { Uri } from '../Uri';
import { Links } from '../Links';

type C = t.INsUri | t.ICellUri | t.IColumnUri | t.IRowUri;

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

  public static toValue(uri: t.IUri, options: { hash?: string } = {}) {
    const query = queryString
      .build({ allowNil: false })
      .add('hash', options.hash)
      .toString();
    return `${uri.toString()}${query}`;
  }

  public static parseLink(linkValue: string) {
    if (!RefLinks.is.refValue(linkValue)) {
      throw new Error(`Cannot parse '${linkValue}' as it is not a supported URI type.`);
    }
    type Q = { hash?: string };
    const res = ref.parseValue<C, Q>(linkValue);
    const { uri, query, value } = res;
    const { hash } = query;
    return {
      value,
      uri,
      hash,
      toString(args: { hash?: string | null } = {}) {
        const query = queryString
          .build({ allowNil: false })
          .add('hash', args.hash === null ? null : args.hash || hash)
          .toString();
        return `${uri.toString()}${query}`;
      },
    };
  }

  /**
   * Converts a links URI map into a list of parsed link-refs.
   */
  public static toList(links: t.IUriMap = {}) {
    return ref.toList(links).map(({ key, value }) => toRefLink(key, value));
  }

  /**
   * Lookup a file on the given links.
   */
  public static find(links: t.IUriMap = {}) {
    return {
      byName(path?: string) {
        const match = ref.find(links).byName(path);
        return match ? toRefLink(match.key, match.value) : undefined;
      },
    };
  }
}

/**
 * [Helpers]
 */

function toRefLink(key: string, value: string): t.IRefLink {
  const { dir, path, name, ext } = RefLinks.parseKey(key);
  const { uri, hash } = RefLinks.parseLink(value);
  const res: t.IRefLink = { uri, key, value, hash, path, dir, name, ext };
  return res;
}
