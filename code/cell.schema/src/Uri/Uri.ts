import { coord, cuid, slug, t, wildcard } from '../common';

type UriType = 'NS' | 'CELL' | 'ROW' | 'COLUMN' | 'FILE';
type UriPrefix = 'ns' | 'cell' | 'file';
type AllowPattern = string | ((input: string) => boolean);
type Allow = { NS: AllowPattern[] };
type P<T extends t.IUri> = (parsed: t.IUriParts<T>) => void;

const ALLOW: Allow = { NS: [] };
export const DEFAULT = { ALLOW };

const stripQuotes = (text: string) =>
  text.trim().replace(/^"/, '').replace(/"$/, '').replace(/^'/, '').replace(/'$/, '').trim();

/**
 * Helpers for working with URIs.
 */
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
    A1: () => Uri.create.cell(cuid(), 'A1'),
  };

  /**
   * Cleans up an input string.
   */
  public static clean(input?: string) {
    let text = stripQuotes(input || '');
    text = text.replace(/^=/, '').trim(); // NB: = prefix (eg. spreadsheet REF).
    text = stripQuotes(text);
    text = text.split('?')[0].trim(); // NB: trim query-string.
    return text;
  }

  /**
   * Parse a URI into it's constituent parts.
   */
  public static parse<D extends t.IUri>(input?: string): t.IUriParts<D> {
    let text = Uri.clean(input);
    let data: t.IUri = { type: 'UNKNOWN' };
    let error: t.IUriError | undefined;
    const toString = () => text;

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
        setError(!Uri.is.valid.ns(id), `URI contains an invalid "ns" identifier ("${id}")`);
        const uri: t.INsUri = { type: 'NS', id, toString };
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
        const uri: t.IFileUri = { type: 'FILE', id, ns, file, toString };
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

        if (!id.includes(':')) {
          setError(
            true,
            `The 'cell' URI does not have a coordinate address, eg. ":A1" in "cell:foo:A1"`,
          );
        } else {
          const bang = id.replace(/:/g, '!');
          const parts = coord.cell.toCell(bang);
          type = coord.cell.toType(bang) as UriType;
          key = parts.key;
          ns = parts.ns;
          setError(!key, `Coordinate key of '${type || '<empty>'}' not found`);
          setError(!ns, `Coordinate namespace of '${type || '<empty>'}' not found`);
          if (!error) {
            text = toUri('cell', type, ns, key); // Ensure any loose input parts are now correct.
          }
        }
        data = { type, id, ns, key, toString } as any;
      }
    }

    // Finish up.
    const ok = !error && data.type !== 'UNKNOWN';
    const res: t.IUriParts<D> = {
      ok,
      uri: text,
      type: data.type,
      parts: data as D,
      toString,
    };
    return error ? { ...res, error } : res;
  }

  /**
   * Parse (typed helpers)
   */

  public static ns(input?: string | t.INsUri | undefined, throwError?: boolean | P<t.INsUri>) {
    input = typeof input === 'string' && !input.includes(':') ? `ns:${input.trim()}` : input;
    return parseOrThrow<t.INsUri>(input, 'NS', throwError);
  }

  public static cell(input: string | t.ICellUri | undefined, throwError?: boolean | P<t.ICellUri>) {
    return parseOrThrow<t.ICellUri>(input, 'CELL', throwError);
  }

  public static row(input: string | t.IRowUri | undefined, throwError?: boolean | P<t.IRowUri>) {
    return parseOrThrow<t.IRowUri>(input, 'ROW', throwError);
  }

  public static column(
    input: string | t.IColumnUri | undefined,
    throwError?: boolean | P<t.IColumnUri>,
  ) {
    return parseOrThrow<t.IColumnUri>(input, 'COLUMN', throwError);
  }

  public static file(input: string | t.IFileUri | undefined, throwError?: boolean | P<t.IFileUri>) {
    return parseOrThrow<t.IFileUri>(input, 'FILE', throwError);
  }

  public static eq(a?: t.IUri | string, b?: t.IUri | string): boolean {
    const toString = (input?: t.IUri | string) => {
      input = input === undefined || input === null ? '' : input;
      const text = input.toString().trim();
      return !text.includes(':') ? `ns:${text}` : text;
    };
    return toString(a) === toString(b);
  }

  /**
   * Helpers for evalutating boolean conditions about a URI.
   */
  public static is = {
    /**
     * Determine if the given value is a recognized URI.
     */
    uri: (input?: string) => {
      try {
        return Uri.parse(input).ok;
      } catch (error: any) {
        return false;
      }
    },

    /**
     * Determine if the URI is of a specific type.
     */
    type: (type: t.UriType | t.UriType[], input?: string) => {
      try {
        const uri = Uri.parse(input);
        const types = Array.isArray(type) ? type : [type];
        return types.some((type) => {
          return uri.parts.type === type && (type === 'UNKNOWN' ? true : uri.ok);
        });
      } catch (error: any) {
        return false;
      }
    },

    ns: (input?: string) => Uri.is.type('NS', input),
    file: (input?: string) => Uri.is.type('FILE', input),
    cell: (input?: string) => Uri.is.type('CELL', input),
    row: (input?: string) => Uri.is.type('ROW', input),
    column: (input?: string) => Uri.is.type('COLUMN', input),

    valid: {
      ns(input?: string) {
        const value = (input || '').replace(/^ns:/, '');

        if (!value) {
          return false;
        }

        if (isCuid(value)) {
          return true;
        }

        // Check for any illegal characters.
        const matchLegal = value.match(/^[A-Za-z0-9.]*$/);
        if (!matchLegal || (matchLegal && matchLegal[0] !== value)) {
          return false;
        }

        // NOTE:  Certain NS ids are allowed for testing or for
        //        special environments like locally running apps
        //        (equivalent of "local" IP addresses).
        return Uri.ALLOW.NS.some((pattern) => {
          return typeof pattern === 'string'
            ? pattern.includes('*')
              ? wildcard.isMatch(value, pattern)
              : pattern === value
            : pattern(value);
        });
      },
    },
  };

  /**
   * Helpers for stripped prefixes.
   */
  public static strip = {
    ns: (input?: string) => stripPrefix(input, 'ns'),
    cell: (input?: string) => stripPrefix(input, 'cell'),
    file: (input?: string) => stripPrefix(input, 'file'),
  };

  /**
   * Helpers for converting one URI type to another.
   */
  public static toNs(input?: string | t.IUri) {
    if (input === undefined) {
      return Uri.ns(cuid());
    }

    if (typeof input === 'string') {
      input = Uri.clean(input);
    }

    if (typeof input === 'string' && !input.includes(':')) {
      return Uri.ns(input);
    }

    const obj = typeof input === 'string' ? Uri.parse(input).parts : input;
    if (obj.type === 'NS') {
      return obj;
    }

    if (obj.type === 'CELL' || obj.type === 'COLUMN' || obj.type === 'ROW') {
      return Uri.ns((obj as t.ICoordUri).ns);
    }

    if (obj.type === 'FILE') {
      return Uri.ns((obj as t.IFileUri).ns);
    }

    throw new Error(`A namespace cannot be derived from the uri (${input.toString()})`);
  }

  /**
   * Extracts the index of the row of the given URI.
   */
  public static toRowIndex(input?: string | t.IUri) {
    const uri = typeof input === 'object' ? input : Uri.parse(input).parts;
    if (uri.type === 'CELL' || uri.type === 'COLUMN' || uri.type === 'ROW') {
      return coord.cell.toRowIndex(uri.key);
    } else {
      return -1;
    }
  }

  /**
   * Extracts the index of the row of the given URI.
   */
  public static toColumnIndex(input?: string | t.IUri) {
    const uri = typeof input === 'object' ? input : Uri.parse(input).parts;
    if (uri.type === 'CELL' || uri.type === 'COLUMN' || uri.type === 'ROW') {
      return coord.cell.toColumnIndex(uri.key);
    } else {
      return -1;
    }
  }
}

/**
 * [Helpers]
 */

const alphaNumeric = new RegExp(/^[a-z0-9]+$/i); // NB: alpha-numeric.

function trimPrefix(prefix: string, input: string) {
  const regex = new RegExp(`^${prefix}:+`);
  return input.trim().replace(regex, '');
}

function toUri(prefix: UriPrefix, type: UriType, id: string, suffix?: string) {
  id = (id || '').trim();
  id = id === ':' ? '' : id;

  if (id) {
    ['ns', 'cell', 'file'].forEach((prefix) => (id = trimPrefix(prefix, id)));
  }

  if (!id) {
    throw new Error(`The "${prefix}" URI was not supplied with a namespace identifier. ("${id}")`);
  }

  if (!Uri.is.valid.ns(id)) {
    const err = `URI contains an invalid "${prefix}" identifier, must be an alpha-numeric cuid. ("${id}")`;
    throw new Error(err);
  }

  if (typeof suffix === 'string') {
    suffix = (suffix || '').trim().replace(/^:*/, '');
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
        const err = `The suffix "undefined" (string) was given - this it likely an upstream error where an [undefined] value has been converted into a string.`;
        throw new Error(err);
      }

      suffix = suffix || '';
      const suffixType = coord.cell.toType(suffix) || '';
      if (suffixType !== type) {
        const key = suffix || '';
        const err = `The "${prefix}:" URI was not supplied with a valid ${type} key (given key "${key}").`;
        throw new Error(err);
      }
      suffix = `:${suffix}`;
    }
  }

  return `${prefix}:${id}${suffix || ''}`;
}

function isCuid(input: string) {
  return input.length === 25 && input[0] === 'c' && alphaNumeric.test(input);
}

function parseOrThrow<T extends t.IUri>(
  input: T | string | undefined,
  type: T['type'],
  throwError?: boolean | P<T>,
) {
  if (typeof input === 'object') {
    return input;
  } else {
    const parsed = Uri.parse<T>(input);
    const isTypeMismatch = type && parsed.type !== type;
    const hasError = Boolean(parsed.error) || isTypeMismatch;
    throwError = throwError === undefined ? true : throwError;

    if (hasError) {
      const text = input?.toString() || '';
      if (!parsed.error && isTypeMismatch) {
        parsed.ok = false;
        parsed.error = {
          uri: text,
          message: `The uri (${text}) is not of type ${type}`,
          type: 'URI',
        };
      }

      if (typeof throwError === 'function') {
        throwError(parsed);
      }
      if (throwError === true) {
        if (parsed.error) {
          throw new Error(parsed.error.message);
        }
      }
    }

    // Finish up.
    return parsed.parts;
  }
}

function stripPrefix(input: string | undefined, prefix: UriPrefix) {
  const left = `${prefix}:`;
  input = (input || '').trim();
  input = input.startsWith(left) ? input.substring(left.length) : input;
  return input;
}
