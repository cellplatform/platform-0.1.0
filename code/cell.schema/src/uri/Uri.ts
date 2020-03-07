import { t, cuid, slug, coord, wildcard } from '../common';

type UriType = 'NS' | 'CELL' | 'ROW' | 'COLUMN' | 'FILE';
type UriPrefix = 'ns' | 'cell' | 'file';
type AllowPattern = string | ((input: string) => boolean);
type Allow = { NS: AllowPattern[] };

const ALLOW: Allow = { NS: ['foo'] };
export const DEFAULT = { ALLOW };

export class Uri {
  public static cuid = cuid;
  public static slug = slug;
  public static ALLOW = { ...DEFAULT.ALLOW };

  /**
   * Construct a URI string from arguments.
   */
  public static create = {
    ns: (id: string) => toUri('ns', 'NS', id),
    cell: (ns: string, key: string) => toUri('cell', 'CELL', ns, key),
    row: (ns: string, key: string) => toUri('cell', 'ROW', ns, key),
    column: (ns: string, key: string) => toUri('cell', 'COLUMN', ns, key),
    file: (ns: string, fileid: string) => toUri('file', 'FILE', ns, fileid), // NB: use `slug` for file-id.
  };

  /**
   * Parse a URI into it's constituent pieces.
   */
  public static parse<D extends t.IUri>(input?: string): t.IUriParts<D> {
    let text = (input || '').trim().split('?')[0]; // NB: trim query-string.
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

      if (left === 'ns') {
        /**
         * Namespace.
         */
        const id = right;
        setError(!id, 'Namespace URI identifier not found');
        setError(!isValidId(id), 'URI contains an invalid "ns" identifier');
        const uri: t.INsUri = { type: 'NS', id };
        data = uri;
      } else if (left === 'file') {
        /**
         * File
         */
        const id = right;
        setError(!id, 'File URI identifier not found');
        const parts = id.split(':');
        const ns = (parts[0] || '').trim();
        const file = (parts[1] || '').trim();
        setError(!file, `File identifier within namespace "${ns}" not found`);
        const uri: t.IFileUri = { type: 'FILE', id, ns, file };
        data = uri;
      } else if (left === 'cell') {
        /**
         * Cell/Row/Column
         */
        const id = right || '';
        setError(!id, `ID of 'cell' not found`);

        let type = 'CELL' as UriType;
        let key = '';
        let ns = '';
        if (!id.includes('!')) {
          setError(true, `The 'cell' URI does not contain a "!" character.`);
        } else {
          type = coord.cell.toType(id) as UriType;
          const parts = coord.cell.toCell(id);
          key = parts.key;
          ns = parts.ns;
          setError(!key, `Coordinate key of '${type || '<empty>'}' not found`);
          setError(!ns, `Coordinate namespace of '${type || '<empty>'}' not found`);
          if (!error) {
            text = toUri('cell', type, ns, key); // Ensure any loose input parts are now correct.
          }
        }
        data = { type, id, ns, key } as any;
      }
    }

    // Finish up.
    const ok = !Boolean(error) && data.type !== 'UNKNOWN';
    const res: t.IUriParts<D> = {
      ok,
      uri: text,
      type: data.type,
      parts: data as D,
      toString: () => text,
    };
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
    type: (type: t.UriType, input?: string) => {
      const uri = Uri.parse(input);
      return uri.parts.type === type && (type === 'UNKNOWN' ? true : uri.ok);
    },

    ns: (input?: string) => Uri.is.type('NS', input),
    file: (input?: string) => Uri.is.type('FILE', input),
    cell: (input?: string) => Uri.is.type('CELL', input),
    row: (input?: string) => Uri.is.type('ROW', input),
    column: (input?: string) => Uri.is.type('COLUMN', input),
  };
}

/**
 * [Helpers]
 */
const alphaNumeric = new RegExp(/^[a-z0-9]+$/i); // NB: alpha-numeric.

function trimPrefix(prefix: string, input: string) {
  const regex = new RegExp(`^${prefix}\:+`);
  return input.trim().replace(regex, '');
}

function toUri(prefix: UriPrefix, type: UriType, id: string, suffix?: string) {
  id = (id || '').trim();
  id = id === ':' ? '' : id;

  if (id) {
    ['ns', 'cell', 'file'].forEach(prefix => (id = trimPrefix(prefix, id)));
  }

  if (!id) {
    throw new Error(`The "${prefix}" URI was not supplied with a namespace identifier.`);
  }

  if (!isValidId(id)) {
    const err = `URI contains an invalid "${prefix}" identifier, must be an alpha-numeric cuid.`;
    throw new Error(err);
  }

  if (typeof suffix === 'string') {
    suffix = (suffix || '').trim().replace(/^\!*/, '');
    if (!suffix) {
      throw new Error(`The "${prefix}" URI was not supplied with a suffix key.`);
    }
    if (prefix === 'file') {
      if (!alphaNumeric.test(suffix)) {
        const err = `The "file" URI contains an invalid file-identifier, must be alpha-numeric ("${suffix}").`;
        throw new Error(err);
      }
      suffix = `:${suffix}`;
    } else {
      if (suffix === 'undefined') {
        throw new Error('BOO');
      }

      suffix = suffix || '';
      const suffixType = coord.cell.toType(suffix) || '';
      if (suffixType !== type) {
        const key = suffix || '';
        const err = `The "${prefix}:" URI was not supplied with a valid ${type} key (given key "${key}").`;
        throw new Error(err);
      }
      suffix = `!${suffix}`;
    }
  }

  return `${prefix}:${id}${suffix || ''}`;
}

function isCuid(input: string) {
  return input.length === 25 && input[0] === 'c' && alphaNumeric.test(input);
}

function isValidId(input: string) {
  input = (input || '').replace(/^ns\:/, '');

  if (isCuid(input)) {
    return true;
  }

  // NOTE:  Certain NS ids are allowed for testing or for
  //        special environments like locally running apps
  //        (equivalent of "local" IP addresses).
  return Uri.ALLOW.NS.some(pattern => {
    return typeof pattern === 'string'
      ? pattern.includes('*')
        ? wildcard.isMatch(input, pattern)
        : pattern === input
      : pattern(input);
  });
}
