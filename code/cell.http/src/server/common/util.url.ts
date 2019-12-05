import { Schema } from './libs';
import * as t from './types';

/**
 * URL generator.
 */
export function url(host: string) {
  const toUrl = (path: string) => formatUrl(host, path);
  const url = {
    nsLinks(uri: string): t.IResGetNsLinks {
      return {
        data: toUrl(`${uri}/data`),
      };
    },

    cell(uri: string) {
      return toUrl(uri);
    },

    cellLinks(uri: string): t.IResGetCellLinks {
      return {
        cell: toUrl(uri),
        files: toUrl(`${uri}/files`),
      };
    },

    cellFilesLinks(uri: string, links: t.ICellData['links']): t.IResGetCellFiles['links'] {
      return Object.keys(links || {})
        .map(key => ({ key, value: (links || {})[key] }))
        .filter(({ value }) => Schema.uri.is.file(value))
        .reduce((acc, next) => {
          const { key } = next;
          const filename = Schema.file.links.toFilename(key);
          acc[filename] = toUrl(`${uri}/files/${filename}`);
          return acc;
        }, {});
    },

    cellFilesList(links: t.ICellData['links']): t.IResGetFilesLink[] {
      return Object.keys(links || {})
        .map(key => ({ key, value: (links || {})[key] }))
        .filter(({ value }) => Schema.uri.is.file(value))
        .map(({ key, value }) => {
          const fileUri = value;
          const name = Schema.file.links.toFilename(key);
          const link: t.IResGetFilesLink = {
            uri: fileUri,
            name,
            ...url.cellFile(fileUri),
          };
          return link;
        });
    },

    cellFile(uri: string): t.IResGetFileLinks {
      return {
        file: toUrl(`${uri}`),
        info: toUrl(`${uri}/info`),
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
export function formatUrl(host: string | undefined, path: string) {
  const prefix = (host || '').startsWith('localhost') ? 'http' : 'https';
  path = path.replace(/^\/*/, '');
  return `${prefix}://${host}/${path}`;
}
