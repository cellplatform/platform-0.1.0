import { Schema } from './libs';
import * as t from './types';

/**
 * URL generator.
 */
export function url(host: string) {
  const url = {
    toUrl(path: string) {
      return toUrl(host, path);
    },

    nsLinks(uri: string): t.IResGetNsLinks {
      return {};
    },

    cellLinks(uri: string): t.IResGetCellLinks {
      return {
        cell: toUrl(host, uri),
        files: toUrl(host, `${uri}/files`),
      };
    },

    cellFiles(links: t.ICellData['links']): t.IResGetFilesLink[] {
      return Object.keys(links || {})
        .map(key => ({ key, value: (links || {})[key] }))
        .filter(({ value }) => Schema.uri.is.file(value))
        .map(({ key, value }) => {
          const uri = value;
          const name = Schema.file.links.toFilename(key);
          const link: t.IResGetFilesLink = {
            uri,
            name,
            ...url.cellFile(uri),
          };
          return link;
        });
    },

    cellFile(uri: string): t.IResGetFileLinks {
      return {
        file: toUrl(host, `${uri}`),
        info: toUrl(host, `${uri}/info`),
      };
    },

    rowLinks(uri: string): t.IResGetRowLinks {
      return {};
    },

    columnLinks(uri: string): t.IResGetColumnLinks {
      return {};
    },
  };
  return url;
}

/**
 * Generates a formatted URL.
 */
export function toUrl(host: string | undefined, path: string) {
  const prefix = (host || '').startsWith('localhost') ? 'http' : 'https';
  path = path.replace(/^\/*/, '');
  return `${prefix}://${host}/${path}`;
}
