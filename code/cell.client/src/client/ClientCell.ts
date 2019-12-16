import { Schema, Urls, t, Uri, FormData, http, ERROR } from '../common';

export type IClientCellArgs = { uri: string; urls: t.IUrls };

/**
 * An HTTP client for operating on [Cell]'s.
 */
export class ClientCell {
  public static create(args: IClientCellArgs) {
    return new ClientCell(args);
  }

  /**
   * [Lifecycle]
   */
  private constructor(args: IClientCellArgs) {
    this.uri = Uri.parse<t.ICellUri>(args.uri);
    this.urls = args.urls;
    this.url = this.urls.cell(args.uri);
  }

  /**
   * [Fields]
   */
  private readonly urls: t.IUrls;
  private readonly url: t.IUrlsCell;
  public readonly uri: t.IUriParts<t.ICellUri>;

  /**
   * [Properties]
   */

  public async info() {
    const url = this.url.info;
    const res = await http.get(url.toString());
    return toResponse<t.IResGetCell>(res);
  }

  public get file() {
    const self = this;
    const fileUrl = this.url.file;
    return {
      /**
       * Operate on a file by name.
       */
      name(filename: string) {
        return {
          /**
           * Upload a file and associate it with the cell.
           */
          async upload(data: ArrayBuffer) {
            // Prepare the form data.
            const form = new FormData();
            form.append('file', data, { contentType: 'application/octet-stream' });
            const headers = form.getHeaders();

            // POST to the service.
            const url = fileUrl.byName(filename);
            const res = await http.post(url.toString(), form, { headers });

            // Finish up.
            return toResponse<t.IResPostCellFile>(res);
          },

          /**
           * Retrieve the info about the given file.
           */
          async download() {
            // Get cell info.
            const cellRes = await self.info();
            if (!cellRes.body) {
              const err = `Info about the cell "${self.uri.toString()}" not found.`;
              return toError(404, ERROR.HTTP.NOT_FOUND, err);
            }

            // Look up link reference.
            const cellInfo = cellRes.body.data;
            const links = cellInfo.links || {};
            const fileLinkKey = Schema.file.links.toKey(filename);
            const fileLinkValue = links[fileLinkKey];
            if (!fileLinkValue) {
              const err = `A link within "${self.uri.toString()}" to the filename '${filename}' does not exist.`;
              return toError(404, ERROR.HTTP.NOT_FOUND, err);
            }

            // Prepare the URL.
            let url = fileUrl.byName(filename);
            const link = Schema.file.links.parseLink(fileLinkValue);
            url = link.hash ? url.query({ hash: link.hash }) : url;

            // Request the download.
            const res = await http.get(url.toString());
            if (res.ok) {
              return toResponse<ReadableStream>(res, { bodyType: 'BINARY' });
            } else {
              const err = `Failed while downloading file "${self.uri.toString()}".`;
              return toError(res.status, ERROR.HTTP.SERVER, err);
            }
          },
        };
      },
    };
  }

  /**
   * [Methods]
   */
  public toString() {
    return this.uri.toString();
  }
}

/**
 * Helpers
 */

function toResponse<T>(
  res: t.IHttpResponse,
  options: { bodyType?: 'JSON' | 'BINARY' } = {},
): t.IClientResponse<T> {
  const { bodyType = 'JSON' } = options;
  const { ok, status } = res;

  let body: any = {};
  body = bodyType === 'JSON' ? res.json : body;
  body = bodyType === 'BINARY' ? res.body : body;

  return { ok, status, body: body as T };
}

function toError<T>(status: number, type: string, message: string): t.IClientResponse<T> {
  const error: t.IHttpError = { status, type, message };
  const ok = false;
  const body = ({} as unknown) as T; // HACK typescript sanity - because this is an error the calling code should beware.
  return { ok, status, body, error };
}
