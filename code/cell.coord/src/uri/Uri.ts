import { t, id } from '../common';
import { cell } from '../cell';

const { cuid } = id;

export class Uri {
  /**
   * Parse a URI into it's constituent pieces.
   */
  public static parse<D extends t.IUri>(input?: string): t.IUriParts<D> {
    const text = (input || '').trim();

    let data: t.IUri = { type: 'UNKNOWN' };
    let error: t.IUriError | undefined;

    const setError = (isError: boolean, message: string) => {
      if (!error && isError) {
        error = { type: 'URI', message, uri: text };
      }
    };

    setError(!text, 'URI not specified');

    const index = text.indexOf(':');
    setError(index < 0, 'Not a valid multi-part URI');

    if (!error) {
      const left = text.substring(0, index);
      const right = text.substring(index + 1).trim();

      const setCoord = (type: t.ICoordUri['type']) => {
        const id = right || '';
        setError(!id, `ID of '${type}' not found`);

        let key = '';
        let ns = '';
        if (!id.includes('!')) {
          setError(true, `The '${type}' URI does not contain a "!" character.`);
        } else {
          const parts = cell.toCell(id);
          key = parts.key;
          ns = parts.ns;
          setError(!key, `Coordinate key of '${type}' not found`);
          setError(!ns, `Coordinate namespace of '${type}' not found`);
        }

        data = { type, id, ns, key } as any;
      };

      if (left === 'ns') {
        const id = right;
        setError(!id, 'Namespace ID not found');
        const ns: t.INsUri = { type: 'ns', id };
        data = ns;
      } else if (left === 'cell') {
        setCoord('cell');
      } else if (left === 'row') {
        setCoord('row');
      } else if (left === 'col') {
        setCoord('col');
      }
    }

    // Finish up.
    const ok = !Boolean(error) && data.type !== 'UNKNOWN';
    const res: t.IUriParts<D> = { ok, uri: text, parts: data as D, toString: () => text };
    return error ? { ...res, error } : res;
  }

  /**
   * Helpers for evalutating boolean conditions about a URI.
   */
  public static is = {
    /**
     * Determine if the given value is a recognized URI.
     */
    uri: (input?: string) => Uri.parse(input).ok,

    /**
     * Determine if the URI is of a specific type.
     */
    type: (type: t.UriType, input?: string) => Uri.parse(input).parts.type === type,
    ns: (input?: string) => Uri.is.type('ns', input),
    cell: (input?: string) => Uri.is.type('cell', input),
    row: (input?: string) => Uri.is.type('row', input),
    column: (input?: string) => Uri.is.type('col', input),
  };

  /**
   * Construct a URI string from arguments.
   */
  public static string = {
    ns: (id: string) => toUri('ns', id),
    cell: (ns: string, key: string) => toUri('cell', ns, key),
    row: (ns: string, key: string) => toUri('row', ns, key),
    column: (ns: string, key: string) => toUri('col', ns, key),
  };

  /**
   * Generate new URIs.
   */
  public static generate = {
    ns: (id?: string) => Uri.string.ns(id || cuid()),
    cell: (key: string, ns?: string) => Uri.string.cell(ns || cuid(), key),
    row: (key: string, ns?: string) => Uri.string.row(ns || cuid(), key),
    column: (key: string, ns?: string) => Uri.string.column(ns || cuid(), key),
  };
}

/**
 * [Helpers]
 */
function trimPrefix(prefix: string, input: string) {
  const regex = new RegExp(`^${prefix}\:+`);
  return input.trim().replace(regex, '');
}

const PREFIX_MAP: { [key: string]: t.CoordType } = {
  cell: 'CELL',
  col: 'COLUMN',
  row: 'ROW',
};

function toUri(prefix: 'ns' | 'col' | 'row' | 'cell', id: string, suffix?: string) {
  id = id.trim();
  id = id === ':' ? '' : id;
  if (id) {
    ['ns', 'col', 'row', 'cell'].forEach(prefix => (id = trimPrefix(prefix, id)));
  }
  if (!id) {
    throw new Error(`The "${prefix}" URI was not supplied with an ID.`);
  }
  if (typeof suffix === 'string') {
    suffix = suffix.replace(/^\!*/, '');
    if (!suffix) {
      throw new Error(`The "${prefix}" URI was not supplied with a suffix key.`);
    }

    const type = cell.toType(suffix);
    if (PREFIX_MAP[prefix] !== type) {
      throw new Error(
        `The "${prefix}:" URI was not supplied with a valid ${type} key (given key "${suffix}").`,
      );
    }

    suffix = `!${suffix}`;
  }
  return `${prefix}:${id}${suffix || ''}`;
}
