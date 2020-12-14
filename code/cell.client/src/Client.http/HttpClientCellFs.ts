import { ERROR, Schema, t, util } from '../common';
import { uploadFiles } from './HttpClientCellFs.upload';
import { deleteFiles } from './HttpClientCellFs.delete';
import { copyFiles } from './HttpClientCellFs.copy';

type IClientCellFsArgs = { parent: t.IHttpClientCell; urls: t.IUrls; http: t.IHttp };
type GetError = (args: { status: number }) => string;

/**
 * HTTP client for operating on a set of [Cell] files.
 */
export class HttpClientCellFs implements t.IHttpClientCellFs {
  public static create(args: IClientCellFsArgs): t.IHttpClientCellFs {
    return new HttpClientCellFs(args);
  }

  private static parsePath(path: string) {
    const index = path.lastIndexOf('/');
    const filename = index < 0 ? path : path.substring(index + 1);
    const dir = index < 0 ? '' : path.substring(0, index);
    return { path, filename, dir };
  }

  /**
   * [Lifecycle]
   */
  private constructor(args: IClientCellFsArgs) {
    this.args = args;
    this.uri = args.parent.uri;
  }

  /**
   * [Fields]
   */
  private readonly args: IClientCellFsArgs;
  private readonly uri: t.ICellUri;

  /**
   * [Methods]
   */
  public async urls() {
    type T = t.IHttpClientCellFileUrl[];

    const getError: GetError = () => `Failed to get file URLs for [${this.uri.toString()}]`;
    const base = await this.base({ getError });

    const { ok, status, error } = base;
    if (!ok) {
      return util.toClientResponse<T>(status, {} as any, { error });
    }

    const toUrl = (args: { path: string; uri: string; url: string }): t.IHttpClientCellFileUrl => {
      const { path, uri, url } = args;
      const { filename, dir } = HttpClientCellFs.parsePath(path);
      const res: t.IHttpClientCellFileUrl = { uri, filename, dir, path, url };
      return res;
    };

    const body = base.body.urls?.files.map((item) => toUrl(item));
    return util.toClientResponse<T>(status, body || []);
  }

  public async map() {
    type T = t.IFileMap;
    const getError: GetError = () => `Failed to get file map for [${this.uri.toString()}]`;
    const base = await this.base({ getError });

    const { ok, status } = base;
    const body = ok ? base.body.files : ({} as any);
    const error = base.error;

    return util.toClientResponse<T>(status, body, { error });
  }

  public async list(options: { filter?: string } = {}) {
    const { filter } = options;

    type T = t.IHttpClientFileData[];
    const getError: GetError = () => `Failed to get file list for [${this.uri.toString()}]`;
    const base = await this.base({ getError, filter });
    if (!base.ok) {
      const { status } = base;
      const body = {} as any;
      const error = base.error;
      return util.toClientResponse<T>(status, body, { error });
    }

    const urls = base.body.urls?.files || [];
    const map = base.body.files || {};
    const ns = this.uri.ns;

    const body = Object.keys(map).reduce((acc, fileid) => {
      const value = map[fileid];
      if (value) {
        const uri = Schema.Uri.create.file(ns, fileid);
        const url = urls.find((item) => item.uri === uri);
        if (url) {
          const { path, filename, dir } = HttpClientCellFs.parsePath(url.path);
          acc.push({ uri, path, filename, dir, ...value });
        }
      }
      return acc;
    }, [] as t.IHttpClientFileData[]);

    return util.toClientResponse<T>(200, body);
  }

  public upload(
    input: t.IHttpClientCellFileUpload | t.IHttpClientCellFileUpload[],
    options: { changes?: boolean } = {},
  ) {
    const { changes } = options;
    const { http, urls } = this.args;
    const cellUri = this.uri.toString();
    return uploadFiles({ input, http, urls, cellUri, changes });
  }

  public delete(filename: string | string[]) {
    const http = this.args.http;
    const urls = this.args.parent.url;
    return deleteFiles({ http, urls, filename, action: 'DELETE' });
  }

  public unlink(filename: string | string[]) {
    const http = this.args.http;
    const urls = this.args.parent.url;
    return deleteFiles({ http, urls, filename, action: 'UNLINK' });
  }

  public copy(
    files: t.IHttpClientCellFileCopy | t.IHttpClientCellFileCopy[],
    options: t.IHttpClientCellFsCopyOptions = {},
  ) {
    const { changes, permission } = options;
    const http = this.args.http;
    const urls = this.args.parent.url;
    return copyFiles({ http, urls, files, changes, permission });
  }

  /**
   * Internal
   */

  private async base(args: { getError?: GetError; filter?: string } = {}) {
    const { filter, getError } = args;

    type T = t.IResGetCellFiles;
    const http = this.args.http;
    const parent = this.args.parent;
    const url = parent.url.files.list.query({ filter }).toString();

    const files = await http.get(url);

    if (!files.ok) {
      const status = files.status;
      const type = status === 404 ? ERROR.HTTP.NOT_FOUND : ERROR.HTTP.SERVER;
      const message = getError
        ? getError({ status })
        : `Failed to get files data for '${this.uri.toString()}'.`;
      return util.toError<T>(status, type, message);
    }

    const body = files.json as t.IResGetCellFiles;
    return util.toClientResponse<T>(200, body);
  }
}
