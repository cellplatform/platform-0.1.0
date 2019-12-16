import { Schema, Urls, t, Uri, FormData, http, ERROR, util } from '../common';
import { ClientCellFile } from './ClientCellFile';
import { ClientCellLinks } from './ClientCellLinks';

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
    this.uri = Uri.parse<t.ICellUri>(args.uri);
    this.urls = urls;
    this.url = urls.cell(args.uri);
  }

  /**
   * [Fields]
   */
  private readonly urls: t.IUrls;
  public _file: t.IClientCellFile;
  public _links: t.IClientCellLinks;

  public readonly uri: t.IUriParts<t.ICellUri>;
  public readonly url: t.IUrlsCell;

  /**
   * [Properties]
   */
  public get file(): t.IClientCellFile {
    return this._file || (this._file = ClientCellFile.create({ parent: this, urls: this.urls }));
  }

  public get links(): t.IClientCellLinks {
    return this._links || (this._links = ClientCellLinks.create({ parent: this, urls: this.urls }));
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
}
