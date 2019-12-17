import { Schema, Urls, t, Uri, FormData, http, ERROR, util } from '../common';
import { ClientCellLinks } from './ClientCellLinks';
import { ClientCellFile } from './ClientCellFile';
import { ClientCellFiles } from './ClientCellFiles';

export type IClientCellArgs = { uri: string; urls: t.IUrls };

/**
 * An HTTP client for operating on [Cell]'s.
 */
export class ClientCell implements t.IClientCell {
  public static create(args: IClientCellArgs): t.IClientCell {
    return new ClientCell(args);
  }

  /**
   * [Lifecycle]
   */
  private constructor(args: IClientCellArgs) {
    const { urls } = args;
    this.args = args;
    this.uri = Uri.parse<t.ICellUri>(args.uri);
    this.url = urls.cell(args.uri);
  }

  /**
   * [Fields]
   */
  private readonly args: IClientCellArgs;
  private _file: t.IClientCellFile;

  public readonly uri: t.IUriParts<t.ICellUri>;
  public readonly url: t.IUrlsCell;

  /**
   * [Properties]
   */
  public get file(): t.IClientCellFile {
    const urls = this.args.urls;
    return this._file || (this._file = ClientCellFile.create({ parent: this, urls }));
  }

  /**
   * [Methods]
   */
  public toString() {
    return this.uri.toString();
  }

  public async info() {
    const url = this.url.info;
    const res = await http.get(url.toString());
    return util.toResponse<t.IResGetCell>(res);
  }

  public async links() {
    type T = t.IClientResponse<t.IClientCellLinks>;
    const info = await this.info();
    if (info.error) {
      const message = `Failed to get links for '${this.uri.toString()}'. ${info.error.message}`;
      return util.toError(info.status, info.error.type, message) as T;
    }

    const cell = info.body.data;
    const links = cell.links || {};
    const urls = this.args.urls;
    const body = ClientCellLinks.create({ links, urls });

    const res: T = { ok: true, status: 200, body };
    return res;
  }

  public async files() {
    type T = t.IClientResponse<t.IClientCellFiles>;

    const urls = this.args.urls;
    const url = this.url.files;

    const resFiles = await http.get(url.toString());
    if (!resFiles.ok) {
      const status = resFiles.status;
      const type = status === 404 ? ERROR.HTTP.NOT_FOUND : ERROR.HTTP.SERVER;
      const message = `Failed to get files for '${this.uri.toString()}'.`;
      return util.toError(status, type, message) as T;
    }

    const json = resFiles.json as t.IResGetCellFiles;
    const map = json.files;
    const body = ClientCellFiles.create({ parent: this, map, urls });

    const res: T = { ok: true, status: 200, body };
    return res;
  }
}
