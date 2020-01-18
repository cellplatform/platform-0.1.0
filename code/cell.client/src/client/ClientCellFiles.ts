import { ERROR, Schema, t, util } from '../common';
import { upload } from './ClientCellFiles.upload';

export type IClientCellFilesArgs = { parent: t.IClientCell; urls: t.IUrls; http: t.IHttp };
type GetError = (args: { status: number }) => string;

/**
 * HTTP client for operating on a [Cell]'s files.
 */
export class ClientCellFiles implements t.IClientCellFiles {
  public static create(args: IClientCellFilesArgs): t.IClientCellFiles {
    return new ClientCellFiles(args);
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
  private readonly uri: t.IUriParts<t.ICellUri>;

  /**
   * [Methods]
   */
  public async urls() {
    type T = t.IClientResponse<t.IClientCellFileUrl[]>;

    const getError: GetError = () => `Failed to get file URLs for [${this.uri.toString()}]`;
    const base = await this.base({ getError });

    const { ok, status, error } = base;
    if (!ok) {
      return { ok, status, body: {}, error };
    }

    const toUrl = (args: { path: string; uri: string; url: string }): t.IClientCellFileUrl => {
      const { path, uri, url } = args;
      const index = path.lastIndexOf('/');
      const filename = index < 0 ? path : path.substring(index + 1);
      const dir = index < 0 ? '' : path.substring(0, index);
      const res: t.IClientCellFileUrl = { uri, filename, dir, path, url };
      return res;
    };

    const body = base.body.urls.files.map(item => toUrl(item));
    const res: T = { ok, status, body };
    return res as any;
  }

  public async map() {
    type T = t.IClientResponse<t.IFileMap>;
    const getError: GetError = () => `Failed to get file map for [${this.uri.toString()}]`;
    const base = await this.base({ getError });

    const { ok, status } = base;
    const body = ok ? base.body.files : ({} as any);
    const error = base.error;

    const res: T = { ok, status, body, error };
    return res;
  }

  public async list() {
    type T = t.IClientResponse<t.IClientFileData[]>;

    const mapResponse = await this.map();
    if (!mapResponse.ok) {
      const res: T = { ...mapResponse, body: [] };
      return res;
    }

    const map = mapResponse.body;
    const ns = this.uri.parts.ns;

    const body = Object.keys(map).reduce((acc, fid) => {
      const value = map[fid];
      if (value) {
        const uri = Schema.uri.create.file(ns, fid);
        acc.push({ uri, ...value });
      }
      return acc;
    }, [] as t.IClientFileData[]);

    const res: T = { ok: true, status: 200, body };
    return res;
  }

  public async upload(
    input: t.IClientCellFileUpload | t.IClientCellFileUpload[],
    options: { changes?: boolean } = {},
  ) {
    const { changes } = options;
    const { http, urls } = this.args;
    const cellUri = this.uri.toString();
    return upload({ input, http, urls, cellUri, changes }) as any;
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

  private async base(args: { getError?: GetError } = {}) {
    type T = t.IClientResponse<t.IResGetCellFiles>;
    const http = this.args.http;
    const parent = this.args.parent;
    const url = parent.url.files.list.toString();

    const files = await http.get(url);

    if (!files.ok) {
      const status = files.status;
      const type = status === 404 ? ERROR.HTTP.NOT_FOUND : ERROR.HTTP.SERVER;
      const message = args.getError
        ? args.getError({ status })
        : `Failed to get files data for '${this.uri.toString()}'.`;
      return util.toError(status, type, message) as T;
    }

    const body = files.json as t.IResGetCellFiles;
    const res: T = { ok: true, status: 200, body };
    return res;
  }
}

/**
 * Helpers
 */

export async function deleteFiles(args: {
  urls: t.IUrlsCell;
  action: t.IReqDeleteCellFilesBody['action'];
  filename: string | string[];
  http: t.IHttp;
}) {
  const { urls, action, filename, http } = args;
  const filenames = Array.isArray(filename) ? filename : [filename];
  const body: t.IReqDeleteCellFilesBody = { filenames, action };
  const url = urls.files.delete;
  const res = await http.delete(url.toString(), body);
  return util.fromHttpResponse(res).toClientResponse<t.IResDeleteCellFilesData>();
}
