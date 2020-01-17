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
        get urls(): t.IResGetNsUrls {
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

        get urls(): t.IResGetCellUrls {
          const cell = url.cell(cellUri);
          return {
            cell: cell.info.toString(),
            files: cell.files.list.toString(),
          };
        },

        files: {
          urls(links: t.ICellData['links']): t.IResGetCellFiles['urls'] {
            const urls = url.cell(cellUri);
            return Object.keys(links || {})
              .map(key => ({ key, value: (links || {})[key] }))
              .filter(({ value }) => Schema.uri.is.file(value))
              .reduce((acc, next) => {
                const { key, value } = next;
                const { hash } = Schema.file.links.parseLink(value);
                const path = Schema.file.links.parseKey(key).path;
                const url = urls.file.byName(path).query({ hash });
                acc[path] = url.toString();
                return acc;
              }, {});
          },
        },
      };
    },

    file(fileUri: string, hash?: string): t.IResGetFileUrls {
      const fileUrl = url.file(fileUri);
      const download = fileUrl.download.query({ hash });
      return {
        info: fileUrl.info.toString(),
        download: download.toString(),
      };
    },

    rowUrls(uri: string): t.IResGetRowUrls {
      return {};
    },

    columnUrls(uri: string): t.IResGetColumnUrls {
      return {};
    },
  };

  return api;
}
