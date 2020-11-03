import { ERROR, Schema, t, util } from '../common';
import { uploadFiles } from './HttpClientCellFiles.upload';
import { deleteFiles } from './HttpClientCellFiles.delete';

type IClientCellFilesArgs = { parent: t.IHttpClientCell; urls: t.IUrls; http: t.IHttp };
type GetError = (args: { status: number }) => string;

/**
 * HTTP client for operating on a set of [Cell] files.
 */
export class HttpClientCellFiles implements t.IHttpClientCellFiles {
  public static create(args: IClientCellFilesArgs): t.IHttpClientCellFiles {
    return new HttpClientCellFiles(args);
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
  private constructor(args: IClientCellFilesArgs) {
    this.args = args;
    this.uri = args.parent.uri;
  }

  /**
   * [Fields]
   */
  private readonly args: IClientCellFilesArgs;
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
      const { filename, dir } = HttpClientCellFiles.parsePath(path);
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
        const uri = Schema.uri.create.file(ns, fileid);
        const url = urls.find((item) => item.uri === uri);
        if (url) {
          const { path, filename, dir } = HttpClientCellFiles.parsePath(url.path);
          acc.push({ uri, path, filename, dir, ...value });
        }
      }
      return acc;
    }, [] as t.IHttpClientFileData[]);

    return util.toClientResponse<T>(200, body);
  }

  public async upload(
    input: t.IHttpClientCellFileUpload | t.IHttpClientCellFileUpload[],
    options: { changes?: boolean; permission?: t.FsS3Permission } = {},
  ) {
    const { changes, permission } = options;
    const { http, urls } = this.args;
    const cellUri = this.uri.toString();
    return uploadFiles({ input, http, urls, cellUri, changes, permission }) as any;
  }

  public async delete(filename: string | string[]) {
    const urls = this.args.parent.url;
    const http = this.args.http;
    return deleteFiles({ http, urls, filename, action: 'DELETE' });
  }

  public async unlink(filename: string | string[]) {
    const urls = this.args.parent.url;
    const http = this.args.http;
    return deleteFiles({ http, urls, filename, action: 'UNLINK' });
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
