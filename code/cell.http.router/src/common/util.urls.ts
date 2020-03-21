import { Schema } from './libs';
import * as t from './types';
import { toSeconds } from './util.helpers';

/**
 * URL generator.
 */
export function urls(host: string) {
  const urls = Schema.urls(host);

  const api = {
    ns(nsUri: string) {
      const ns = urls.ns(nsUri).info;
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
          return urls.cell(cellUri).info.toString();
        },

        get urls(): t.IResGetCellUrls {
          const builder = urls.cell(cellUri);
          return {
            cell: builder.info.toString(),
            files: builder.files.list.toString(),
          };
        },

        files: {
          urls(
            links: t.ICellData['links'],
            options: { expires?: string } = {},
          ): t.IResGetCellFiles['urls'] {
            const builder = urls.cell(cellUri);
            const files = Object.keys(links || {})
              .map(key => ({ key, value: (links || {})[key] }))
              .filter(({ value }) => Schema.uri.is.file(value))
              .reduce((acc, next) => {
                const { key, value } = next;
                const { path, ext } = Schema.file.links.parseKey(key);
                const link = Schema.file.links.parseLink(key, value);
                const uri = link.uri.toString();
                const hash = link.query.hash;

                let expires = options.expires || '1h';
                const seconds = toSeconds(expires);
                expires = typeof seconds === 'number' && seconds > 3600 ? '1h' : expires;

                const fileByUri = builder.file.byFileUri(uri, ext);
                const fileByName = builder.file.byName(path);

                acc.push({
                  uri,
                  path,
                  'url:latest': fileByName.toString(), // NB: "latest" because hash is not included.
                  url: fileByUri.query({ hash, expires }).toString(),
                });
                return acc;
              }, [] as t.IResGetCellFilesFileUrl[]);

            return {
              cell: builder.info.toString(),
              files,
            };
          },
        },
      };
    },

    file(fileUri: string, hash?: string): t.IResGetFileUrls {
      const fileUrl = urls.file(fileUri);
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
