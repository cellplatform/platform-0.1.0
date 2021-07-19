import { ERROR, Schema, t, util } from '../common';
import { HttpClientCellFile } from './HttpClientCellFile';
import { copyFiles } from './HttpClientCellFs.copy';
import { deleteFiles } from './HttpClientCellFs.delete';
import { uploadFiles } from './HttpClientCellFs.upload';

type GetError = (args: { status: number }) => string;

/**
 * HTTP client for operating on a set of [Cell] files.
 */
export function HttpClientCellFs(args: {
  parent: t.IHttpClientCell;
  urls: t.IUrls;
  http: t.Http;
}): t.IHttpClientCellFs {
  const { parent, urls, http } = args;
  const uri = parent.uri;

  const getBase = async (args: { getError?: GetError; filter?: string } = {}) => {
    type T = t.IResGetCellFs;
    const { filter, getError } = args;
    const url = parent.url.files.list.query({ filter }).toString();
    const files = await http.get(url);

    if (!files.ok) {
      const status = files.status;
      const type = status === 404 ? ERROR.HTTP.NOT_FOUND : ERROR.HTTP.SERVER;
      const message = getError
        ? getError({ status })
        : `Failed to get files data for '${uri.toString()}'.`;
      return util.toError<T>(status, type, message);
    }

    const body = files.json as t.IResGetCellFs;
    return util.toClientResponse<T>(200, body);
  };

  const api: t.IHttpClientCellFs = {
    uri,
    toString: () => uri.toString(),

    file(path: string) {
      return HttpClientCellFile({ parent, urls, http, path });
    },

    /**
     * A listing of URLs for the files attached to the cell.
     */
    async urls() {
      type T = t.IHttpClientCellFileUrl[];

      const getError: GetError = () => `Failed to get file URLs for [${uri.toString()}]`;
      const base = await getBase({ getError });

      const { ok, status, error } = base;
      if (!ok) return util.toClientResponse<T>(status, {} as any, { error });

      const body = base.body.urls?.files.map((item) => toFileUrl(item));
      return util.toClientResponse<T>(status, body || []);
    },

    /**
     * An {object} map of the cell files.
     */
    async map() {
      type T = t.IFileMap;
      const getError: GetError = () => `Failed to get file map for [${uri.toString()}]`;
      const base = await getBase({ getError });

      const { ok, status } = base;
      const body = ok ? base.body.files : ({} as any);
      const error = base.error;

      return util.toClientResponse<T>(status, body, { error });
    },

    /**
     * An [array] list of the cell files.
     */
    async list(options: { filter?: string } = {}) {
      const { filter } = options;

      type T = t.IHttpClientFileData[];
      const getError: GetError = () => `Failed to get file list for [${uri.toString()}]`;
      const base = await getBase({ getError, filter });
      if (!base.ok) {
        const { status } = base;
        const body = {} as any;
        const error = base.error;
        return util.toClientResponse<T>(status, body, { error });
      }

      const urls = base.body.urls?.files || [];
      const map = base.body.files || {};
      const ns = uri.ns;

      const body = Object.keys(map).reduce((acc, fileid) => {
        const value = map[fileid];
        if (value) {
          const uri = Schema.Uri.create.file(ns, fileid);
          const url = urls.find((item) => item.uri === uri);
          if (url) {
            const { path, filename, dir } = parsePath(url.path);
            acc.push({ uri, path, filename, dir, ...value });
          }
        }
        return acc;
      }, [] as t.IHttpClientFileData[]);

      return util.toClientResponse<T>(200, body);
    },

    /**
     * Upload (write) a new file to the cell.
     */
    upload(
      input: t.IHttpClientCellFileUpload | t.IHttpClientCellFileUpload[],
      options: { changes?: boolean } = {},
    ) {
      const { changes } = options;
      const cellUri = uri.toString();
      return uploadFiles({ input, http, urls, cellUri, changes });
    },

    /**
     * Delete the file.
     */
    delete(filename: string | string[]) {
      const urls = parent.url;
      return deleteFiles({ http, urls, filename, action: 'DELETE' });
    },

    /**
     * Unlink the file from the cell (without deleting).
     * NOTE: Used when the file is referenced by another cell.
     */
    unlink(filename: string | string[]) {
      const urls = parent.url;
      return deleteFiles({ http, urls, filename, action: 'UNLINK' });
    },

    /**
     * Make a copy of the file(s).
     */
    copy(
      files: t.IHttpClientCellFileCopy | t.IHttpClientCellFileCopy[],
      options: t.IHttpClientCellFsCopyOptions = {},
    ) {
      const { changes, permission } = options;
      const urls = parent.url;
      return copyFiles({ http, urls, files, changes, permission });
    },
  };

  return api;
}

/**
 * [Helpers]
 */

function parsePath(path: string) {
  const index = path.lastIndexOf('/');
  const filename = index < 0 ? path : path.substring(index + 1);
  const dir = index < 0 ? '' : path.substring(0, index);
  return { path, filename, dir };
}

const toFileUrl = (args: { path: string; uri: string; url: string }): t.IHttpClientCellFileUrl => {
  const { path, uri, url } = args;
  const { filename, dir } = parsePath(path);
  const res: t.IHttpClientCellFileUrl = { uri, filename, dir, path, url };
  return res;
};
