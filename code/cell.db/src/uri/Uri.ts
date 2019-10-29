import { t } from '../common';

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

      const setCoord = (type: t.IUriCoord['type']) => {
        const id = right;
        const parts = id.split(':');
        const ns = parts[0];
        setError(!id, `ID of '${type}' not found`);
        data = { type, id, ns };
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
    const res: IUriParseResponse<D> = { ok, text, data: data as D };
    return error ? { ...res, error } : res;
  }
}
