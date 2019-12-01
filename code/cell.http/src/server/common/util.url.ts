import * as t from './types';

/**
 * URL generator.
 */
export function url(host: string) {
  return {
    nsLinks(uri: string): t.IResGetNsLinks {
      return {};
    },

    cellLinks(uri: string): t.IResGetCellLinks {
      return {
        cell: toUrl(host, uri),
        files: toUrl(host, `${uri}/files`),
      };
    },
    rowLinks(uri: string): t.IResGetRowLinks {
      return {};
    },
    columnLinks(uri: string): t.IResGetColumnLinks {
      return {};
    },
  };
}

/**
 * Generates a formatted URL.
 */
export function toUrl(host: string | undefined, path: string) {
  const prefix = (host || '').startsWith('localhost') ? 'http' : 'https';
  path = path.replace(/^\/*/, '');
  return `${prefix}://${host}/${path}`;
}
