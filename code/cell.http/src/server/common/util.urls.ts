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
          const builder = url.cell(cellUri);
          return {
            cell: builder.info.toString(),
            files: builder.files.list.toString(),
          };
        },

        files: {
          urls(
            links: t.ICellData['links'],
            options: { seconds?: number } = {},
          ): t.IResGetCellFiles['urls'] {
            const builder = url.cell(cellUri);
            const files = Object.keys(links || {})
              .map(key => ({ key, value: (links || {})[key] }))
              .filter(({ value }) => Schema.uri.is.file(value))
              .reduce((acc, next) => {
                const { key, value } = next;
                const { hash, uri } = Schema.file.links.parseLink(value);
                const { path, ext } = Schema.file.links.parseKey(key);

                const fileUri = Schema.uri.parse<t.IFileUri>(uri).parts;
                let filename = `${fileUri.file}`;
                filename = ext ? `${filename}.${ext}` : filename;

                const DEFAULT_MAX = 3600; // Expire in 1-hour.
                const seconds = Math.min(DEFAULT_MAX, options.seconds || DEFAULT_MAX);

                const url = builder.file
                  .byName(filename)
                  .query({ hash, seconds })
                  .toString();
                acc.push({ uri, path, url });
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
