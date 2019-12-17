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
                const { key, value } = next;
                const { hash } = Schema.file.links.parseLink(value);
                const filename = Schema.file.links.toFilename(key);
                const url = urls.file.byName(filename).query({ hash });
                acc[filename] = url.toString();
                return acc;
              }, {});
          },
        },
      };
    },

    file(fileUri: string, hash?: string): t.IResGetFileLinks {
      const fileUrl = url.file(fileUri);
      const download = fileUrl.download.query({ hash });
      return {
        info: fileUrl.info.toString(),
        download: download.toString(),
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
