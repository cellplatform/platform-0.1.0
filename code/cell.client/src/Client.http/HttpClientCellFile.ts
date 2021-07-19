import { ERROR, Schema, t, util } from '../common';

/**
 * HTTP client for operating on files associated with a [Cell].
 */
export function HttpClientCellFile(args: {
  parent: t.IHttpClientCell;
  urls: t.IUrls;
  http: t.Http;
  path: string;
}): t.IHttpClientCellFile {
  const { parent, urls, http, path } = args;

  const api: t.IHttpClientCellFile = {
    path,

    /**
     * Meta-data about the file.
     */
    async info() {
      const linkRes = await getCellLinkByFilename(parent, path);
      if (linkRes.error) {
        return linkRes.error as any;
      }
      if (!linkRes.link) {
        throw new Error(`Link should exist.`);
      }

      // Prepare the URL.
      const link = linkRes.link;
      const url = urls.file(link.uri).info;

      // Call the service.
      const res = await http.get(url.toString());
      return util.fromHttpResponse(res).toClientResponse<t.IResGetFile>();
    },

    /**
     * Determine if the file exists or not.
     */
    async exists() {
      const info = await api.info();
      return info.ok && info.body.exists;
    },

    /**
     * Retrieve the info about the given file.
     */
    async download(
      options: { expires?: string } = {},
    ): Promise<t.IHttpClientResponse<ReadableStream | t.Json | string>> {
      type T = ReadableStream | string;
      const { expires } = options;
      const linkRes = await getCellLinkByFilename(parent, path);

      if (linkRes.error) return linkRes.error as any;
      if (!linkRes.link) {
        throw new Error(`Link should exist.`);
      }

      // Prepare the URL.
      const { link } = linkRes;
      const hash = link.query.hash || undefined;
      const url = parent.url.file
        .byFileUri(link.uri.toString(), link.ext)
        .query({ hash, expires })
        .toString();

      // Request the download.
      const res = await http.get(url);
      if (res.ok) {
        const mime = (res.headers['content-type'] || '').toString().trim();
        const bodyType = toBodyType(mime);
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

  return api;
}

/**
 * [Helpers]
 */

function toBodyType(mime: string): t.HttpClientBodyType {
  if (mime === 'application/json') return 'JSON';
  if (mime.startsWith('text/')) return 'TEXT';
  return 'BINARY';
}

const getCellInfo = async (cell: t.IHttpClientCell) => {
  const res = await cell.info();
  if (!res.body) {
    const message = `Info about the cell "${cell.uri.toString()}" not found.`;
    const error = util.toError(404, ERROR.HTTP.NOT_FOUND, message);
    return { res, error };
  } else {
    const data = res.body.data;
    return { res, data };
  }
};

const getCellLinkByFilename = async (cell: t.IHttpClientCell, path: string) => {
  const { error, data } = await getCellInfo(cell);
  if (!data || error) return { error };

  const link = Schema.File.Links.find(data.links).byName(path);
  if (!link) {
    const message = `A link within "${cell.uri.toString()}" to the filename '${path}' does not exist.`;
    const error = util.toError(404, ERROR.HTTP.NOT_LINKED, message);
    return { error };
  }

  return { link };
};
