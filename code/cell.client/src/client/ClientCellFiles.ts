import { ERROR, FormData, Schema, t, util } from '../common';

export type IClientCellFilesArgs = { parent: t.IClientCell; urls: t.IUrls; http: t.IHttp };
import { upload } from './ClientCellFiles.upload';

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
  public async map() {
    type T = t.IClientResponse<t.IFileMap>;
    const http = this.args.http;
    const parent = this.args.parent;
    const url = parent.url.files.list.toString();

    const resFiles = await http.get(url);
    if (!resFiles.ok) {
      const status = resFiles.status;
      const type = status === 404 ? ERROR.HTTP.NOT_FOUND : ERROR.HTTP.SERVER;
      const message = `Failed to get file map for '${parent.uri.toString()}'.`;
      return util.toError(status, type, message) as T;
    }

    const json = resFiles.json as t.IResGetCellFiles;
    const body = json.files;
    const res: T = { ok: true, status: 200, body };

    return res;
  }

  public async list() {
    type T = t.IClientResponse<t.IClientFileData[]>;
    const parent = this.args.parent;

    const resMap = await this.map();
    if (!resMap.ok) {
      const res: T = { ...resMap, body: [] };
      return res;
    }

    const map = resMap.body;
    const ns = parent.uri.parts.ns;

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
