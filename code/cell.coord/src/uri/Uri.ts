import { t, id } from '../common';
import { cell } from '../cell';

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
   * Generate new URIs.
   */
  public static generate = {
    ns(args: { ns?: string } = {}) {
      const ns = trimInput('ns', args.ns || id.cuid());
      return `ns:${ns}`;
    },
    cell(args: { key: string; ns?: string }) {
      const ns = trimInput('ns', args.ns || id.cuid());
      const key = args.key || id.shortid();
      return `cell:${ns}!${key}`;
    },
    row(args: { key: string; ns?: string }) {
      const ns = trimInput('ns', args.ns || id.cuid());
      const key = args.key || id.shortid();
      return `row:${ns}!${key}`;
    },
    column(args: { key: string; ns?: string }) {
      const ns = trimInput('ns', args.ns || id.cuid());
      const key = args.key || id.shortid();
      return `col:${ns}!${key}`;
    },
  };
}

/**
 * [Helpers]
 */
function trimInput(prefix: string, input: string) {
  const regex = new RegExp(`^${prefix}\:`);
  return input.trim().replace(regex, '');
}
