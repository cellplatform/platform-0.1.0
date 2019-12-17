import { http, t, FormData, util, Schema, ERROR } from '../common';

export type IClientCellFileArgs = { parent: t.IClientCell; urls: t.IUrls };

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
        return util.toResponse<t.IResGetFile>(res);
      },

      /**
       * Upload a file and associate it with the cell.
       */
      async upload(data: ArrayBuffer) {
        // Prepare the form data.
        const form = new FormData();
        form.append('file', data, {
          filename,
          contentType: 'application/octet-stream',
        });
        const headers = form.getHeaders();

        // POST to the service.
        const url = parent.url.file.byName(filename);
        const res = await http.post(url.toString(), form, { headers });

        // Finish up.
        return util.toResponse<t.IResPostCellFile>(res);
      },

      /**
       * Retrieve the info about the given file.
       */
      async download(): Promise<t.IClientResponse<ReadableStream>> {
        const linkRes = await self.getCellLinkByFilename(filename);
        if (linkRes.error) {
          return linkRes.error as any;
        }
        if (!linkRes.link) {
          throw new Error(`Link should exist.`);
        }

        // Prepare the URL.
        const link = linkRes.link;
        const url = parent.url.file.byName(filename).query({ hash: link.hash });

        // Request the download.
        const res = await http.get(url.toString());
        if (res.ok) {
          return util.toResponse<ReadableStream>(res, { bodyType: 'BINARY' });
        } else {
          const message = `Failed while downloading file "${parent.uri.toString()}".`;
          const httpError = res.contentType.is.json ? (res.json as t.IHttpError) : undefined;
          if (httpError) {
            const error = `${message} ${httpError.message}`;
            return util.toError<ReadableStream>(res.status, httpError.type, error);
          } else {
            return util.toError<ReadableStream>(res.status, ERROR.HTTP.SERVER, message);
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

    const link = Schema.file.links.parseLink(linkValue);
    return { link };
  }
}
