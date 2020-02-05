import { t, Uri, util } from '../common';
import { ClientCellFile } from './ClientCellFile';
import { ClientCellFiles } from './ClientCellFiles';
import { ClientCellLinks } from './ClientCellLinks';

export type IClientCellArgs = { uri: string; urls: t.IUrls; http: t.IHttp };

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
  private _files: t.IClientCellFiles;

  public readonly uri: t.IUriParts<t.ICellUri>;
  public readonly url: t.IUrlsCell;

  /**
   * [Properties]
   */
  public get file(): t.IClientCellFile {
    const urls = this.args.urls;
    const http = this.args.http;
    return this._file || (this._file = ClientCellFile.create({ parent: this, urls, http }));
  }

  public get files(): t.IClientCellFiles {
    const urls = this.args.urls;
    const http = this.args.http;
    return this._files || (this._files = ClientCellFiles.create({ parent: this, urls, http }));
  }

  /**
   * [Methods]
   */
  public toString() {
    return this.uri.toString();
  }

  public async info(options: t.IUrlQueryCellInfo = {}) {
    const http = this.args.http;
    const url = this.url.info.query(options).toString();
    const res = await http.get(url);
    return util.fromHttpResponse(res).toClientResponse<t.IResGetCell>();
  }

  public async links() {
    type T = t.IClientCellLinks;

    const info = await this.info();
    if (info.error) {
      const message = `Failed to get links for '${this.uri.toString()}'. ${info.error.message}`;
      return util.toError<T>(info.status, info.error.type, message);
    }

    const http = this.args.http;
    const cell = info.body.data;
    const links = cell.links || {};
    const urls = this.args.urls;
    const body = ClientCellLinks.create({ links, urls, http });

    return util.toClientResponse<T>(200, body);
  }
}
