import { t, id } from '../common';

export type IUriParseResponse<D extends t.IUri = t.IUri> = {
  ok: boolean;
  text: string;
  data: D;
  error?: t.IUriError;
};

export class Uri {
  /**
   * Parse a URI into it's constituent pieces.
   */
  public static parse<D extends t.IUri>(input?: string): IUriParseResponse<D> {
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

      const setCoord = (type: t.IUriCoord['type'], field: 'cell' | 'row' | 'column') => {
        const id = right;
        const parts = id.split(':');
        const ns = parts[0];
        const coordId = parts[1];
        setError(!id, `ID of '${type}' not found`);
        setError(!coordId, `ID part suffix of '${type}' not found`);
        data = { type, id, ns, [field]: coordId } as any;
      };

      if (left === 'ns') {
        const id = right;
        setError(!id, 'Namespace ID not found');
        const ns: t.INsUri = { type: 'ns', id };
        data = ns;
      } else if (left === 'cell') {
        setCoord('cell', 'cell');
      } else if (left === 'row') {
        setCoord('row', 'row');
      } else if (left === 'col') {
        setCoord('col', 'column');
      }
    }

    // Finish up.
    const ok = !Boolean(error) && data.type !== 'UNKNOWN';
    const res: IUriParseResponse<D> = { ok, text, data: data as D };
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
    type: (type: t.UriType, input?: string) => Uri.parse(input).data.type === type,
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
      const ns = args.ns || id.cuid();
      return `ns:${ns}`;
    },
    cell(args: { ns?: string; cell?: string } = {}) {
      const ns = args.ns || id.cuid();
      const cell = args.cell || id.shortid();
      return `cell:${ns}:${cell}`;
    },
    row(args: { ns?: string; row?: string } = {}) {
      const ns = args.ns || id.cuid();
      const row = args.row || id.shortid();
      return `row:${ns}:${row}`;
    },
    column(args: { ns?: string; column?: string } = {}) {
      const ns = args.ns || id.cuid();
      const col = args.column || id.shortid();
      return `col:${ns}:${col}`;
    },
  };
}
