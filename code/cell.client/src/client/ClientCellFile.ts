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
    const parent = this.args.parent;
    return {
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
        // Get cell info.
        const cellRes = await parent.info();
        if (!cellRes.body) {
          const err = `Info about the cell "${parent.uri.toString()}" not found.`;
          return util.toError(404, ERROR.HTTP.NOT_FOUND, err);
        }

        // Look up link reference.
        const cellInfo = cellRes.body.data;
        const links = cellInfo.links || {};
        const fileLinkKey = Schema.file.links.toKey(filename);
        const fileLinkValue = links[fileLinkKey];
        if (!fileLinkValue) {
          const err = `A link within "${parent.uri.toString()}" to the filename '${filename}' does not exist.`;
          return util.toError(404, ERROR.HTTP.NOT_FOUND, err);
        }

        // Prepare the URL.
        let url = parent.url.file.byName(filename);
        const link = Schema.file.links.parseLink(fileLinkValue);
        url = link.hash ? url.query({ hash: link.hash }) : url;

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
}
