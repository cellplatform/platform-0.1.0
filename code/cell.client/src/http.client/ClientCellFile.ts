import { ERROR, Schema, t, util } from '../common';

export type IClientCellFileArgs = { parent: t.IClientCell; urls: t.IUrls; http: t.IHttp };

/**
 * HTTP client for operating on files associated with a [Cell].
 */
export class ClientCellFile implements t.IClientCellFile {
  public static create(args: IClientCellFileArgs): t.IClientCellFile {
    return new ClientCellFile(args);
  }

  /**
   * [Lifecycle]
   */
  private constructor(args: IClientCellFileArgs) {
    this.args = args;
  }

  /**
   * [Fields]
   */
  private readonly args: IClientCellFileArgs;

  /**
   * [Methods]
   */
  public name(filename: string) {
    const http = this.args.http;
    const self = this;
    const parent = this.args.parent;
    return {
      /**
       * Meta-data about the file.
       */
      async info() {
        const linkRes = await self.getCellLinkByFilename(filename);
        if (linkRes.error) {
          return linkRes.error as any;
        }
        if (!linkRes.link) {
          throw new Error(`Link should exist.`);
        }

        // Prepare the URL.
        const link = linkRes.link;
        const url = self.args.urls.file(link.uri).info;

        // Call the service.
        const res = await http.get(url.toString());
        return util.fromHttpResponse(res).toClientResponse<t.IResGetFile>();
      },

      /**
       * Retrieve the info about the given file.
       */
      async download(
        options: { expires?: string } = {},
      ): Promise<t.IClientResponse<ReadableStream | string>> {
        type T = ReadableStream | string;
        const { expires } = options;
        const linkRes = await self.getCellLinkByFilename(filename);
        if (linkRes.error) {
          return linkRes.error as any;
        }
        if (!linkRes.link) {
          throw new Error(`Link should exist.`);
        }

        // Prepare the URL.
        const { link, key } = linkRes;
        const fileid = Schema.uri.parse<t.IFileUri>(link.uri).parts.file;
        const linkName = key.ext ? `${fileid}.${key.ext}` : fileid;
        const hash = link.hash || undefined;

        const url = parent.url.file
          .byName(linkName)
          .query({ hash, expires })
          .toString();

        // Request the download.
        const res = await http.get(url);
        if (res.ok) {
          const mime = (res.headers['content-type'] || '').toString().trim();
          const bodyType: t.ClientBodyType = mime.startsWith('text/') ? 'TEXT' : 'BINARY';
          return util.fromHttpResponse(res).toClientResponse<T>({ bodyType });
        } else {
          const message = `Failed while downloading file "${parent.uri.toString()}".`;
          const httpError = res.contentType.is.json ? (res.json as t.IHttpError) : undefined;
          if (httpError) {
            const error = `${message} ${httpError.message}`;
            return util.toError<T>(res.status, httpError.type, error);
          } else {
            return util.toError<T>(res.status, ERROR.HTTP.SERVER, message);
          }
        }
      },
    };
  }

  /**
   * [Helpers]
   */
  private async getCellInfo() {
    const parent = this.args.parent;
    const res = await parent.info();
    if (!res.body) {
      const message = `Info about the cell "${parent.uri.toString()}" not found.`;
      const error = util.toError(404, ERROR.HTTP.NOT_FOUND, message);
      return { res, error };
    } else {
      const data = res.body.data;
      return { res, data };
    }
  }

  private async getCellLinkByFilename(filename: string) {
    const parent = this.args.parent;
    const { error, data } = await this.getCellInfo();
    if (!data || error) {
      return { error };
    }

    const links = data.links || {};
    const linkKey = Schema.file.links.toKey(filename);
    const linkValue = links[linkKey];
    if (!linkValue) {
      const message = `A link within "${parent.uri.toString()}" to the filename '${filename}' does not exist.`;
      const error = util.toError(404, ERROR.HTTP.NOT_FOUND, message);
      return { error };
    }

    return {
      key: Schema.file.links.parseKey(linkKey),
      link: Schema.file.links.parseLink(linkValue),
    };
  }
}
