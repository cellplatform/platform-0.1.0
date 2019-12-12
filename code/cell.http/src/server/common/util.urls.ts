import { Schema } from './libs';
import * as t from './types';

/**
 * URL generator.
 */
export function urls(host: string) {
  const url = Schema.url(host);

  const api = {
    ns(nsUri: string) {
      const ns = url.ns(nsUri).info;
      return {
        get links(): t.IResGetNsLinks {
          return {
            data: ns.query({ data: true }).toString(),
          };
        },
      };
    },

    cell(cellUri: string) {
      return {
        get info() {
          return url.cell(cellUri).info.toString();
        },
        get links(): t.IResGetCellLinks {
          const cell = url.cell(cellUri);
          return {
            cell: cell.info.toString(),
            files: cell.files.toString(),
          };
        },

        files: {
          links(links: t.ICellData['links']): t.IResGetCellFiles['links'] {
            const urls = url.cell(cellUri);
            return Object.keys(links || {})
              .map(key => ({ key, value: (links || {})[key] }))
              .filter(({ value }) => Schema.uri.is.file(value))
              .reduce((acc, next) => {
                const { key } = next;
                const filename = Schema.file.links.toFilename(key);
                acc[filename] = urls.file.byName(filename).toString();
                return acc;
              }, {});
          },

          list(links: t.ICellData['links']): t.IResGetFilesLink[] {
            return Object.keys(links || {})
              .map(key => ({ key, value: (links || {})[key] }))
              .filter(({ value }) => Schema.uri.is.file(value))
              .map(({ key, value }) => {
                const fileUri = value;
                const name = Schema.file.links.toFilename(key);
                const link: t.IResGetFilesLink = {
                  uri: fileUri,
                  name,
                  ...api.file(fileUri),
                };
                return link;
              });
          },
        },
      };
    },

    file(fileUri: string): t.IResGetFileLinks {
      const file = url.file(fileUri);
      return {
        file: file.download.toString(),
        info: file.info.toString(),
      };
    },

    rowLinks(uri: string): t.IResGetRowLinks {
      return {};
    },

    columnLinks(uri: string): t.IResGetColumnLinks {
      return {};
    },
  };

  return api;
}
