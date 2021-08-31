import { Path, Uri } from './libs';

type ParsedCellAddress = {
  domain: string;
  uri: string;
  error?: string;
  toString(): string;
};

/**
 * Helpers for working with a cell address.
 */
export const CellAddress = {
  create(domain: string, uri: string) {
    return CellAddress.parse(`${domain}/${uri}`);
  },

  parse(input: string) {
    const res: ParsedCellAddress = {
      domain: '',
      uri: '',
      error: '',
      toString: () => (res.error ? '' : `${res.domain}/${res.uri}`),
    };

    const asError = (message: string) => {
      res.error = `Invalid cell address: ${message}`;
      return res;
    };

    if (typeof input !== 'string') {
      return asError('not a string');
    }

    input = (input || '').trim();
    if (!input) {
      return asError('empty');
    }

    const parts = Path.trimHttp(input).split('/');
    res.domain = Path.trim(parts[0]);
    res.uri = Path.trim(parts[1]);

    if (!res.domain) return asError('no domain');
    if (!res.uri) return asError('no <cell:uri>');

    const invalid = `invalid <cell:uri>: "${res.uri}"`;
    try {
      const parsed = Uri.parse(res.uri);
      if (parsed.type !== 'CELL') return asError(invalid);
      if (parsed.error) return asError(invalid);
    } catch (error) {
      return asError(invalid);
    }

    if (!res.error) delete res.error;
    return res;
  },
};
