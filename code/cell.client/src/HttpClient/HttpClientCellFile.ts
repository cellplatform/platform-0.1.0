import { ERROR, Schema, t, util } from '../common';

type IClientCellFileArgs = { parent: t.IHttpClientCell; urls: t.IUrls; http: t.IHttp };

/**
 * HTTP client for operating on files associated with a [Cell].
 */
export class HttpClientCellFile implements t.IHttpClientCellFile {
  public static create(args: IClientCellFileArgs): t.IHttpClientCellFile {
    return new HttpClientCellFile(args);
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
  public name(path: string) {
    const http = this.args.http;
    const self = this;
    const parent = this.args.parent;
    return {
      /**
       * Meta-data about the file.
       */
      async info() {
        const linkRes = await self.getCellLinkByFilename(path);
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
      ): Promise<t.IHttpClientResponse<ReadableStream | string>> {
        type T = ReadableStream | string;
        const { expires } = options;
        const linkRes = await self.getCellLinkByFilename(path);
        if (linkRes.error) {
          return linkRes.error as any;
        }
        if (!linkRes.link) {
          throw new Error(`Link should exist.`);
        }

        // Prepare the URL.
        const { link } = linkRes;
        const hash = link.hash || undefined;
        const url = parent.url.file
          .byFileUri(link.uri.toString(), link.ext)
          .query({ hash, expires })
          .toString();

        // Request the download.
        const res = await http.get(url);
        if (res.ok) {
          const mime = (res.headers['content-type'] || '').toString().trim();
          const bodyType: t.HttpClientBodyType = mime.startsWith('text/') ? 'TEXT' : 'BINARY';
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

  private async getCellLinkByFilename(path: string) {
    const parent = this.args.parent;
    const { error, data } = await this.getCellInfo();
    if (!data || error) {
      return { error };
    }

    const link = Schema.file.links.find(data.links).byName(path);
    if (!link) {
      const message = `A link within "${parent.uri.toString()}" to the filename '${path}' does not exist.`;
      const error = util.toError(404, ERROR.HTTP.NOT_LINKED, message);
      return { error };
    }

    return { link };
  }
}
