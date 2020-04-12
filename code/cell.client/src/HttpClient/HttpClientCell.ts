import { t, Uri, util } from '../common';
import { HttpClientCellFile } from './HttpClientCellFile';
import { HttpClientCellFiles } from './HttpClientCellFiles';
import { HttpClientCellLinks } from './HttpClientCellLinks';

type IHttpClientCellArgs = { uri: string; urls: t.IUrls; http: t.IHttp };

/**
 * An HTTP client for operating on [Cell]'s.
 */
export class HttpClientCell implements t.IHttpClientCell {
  public static create(args: IHttpClientCellArgs): t.IHttpClientCell {
    return new HttpClientCell(args);
  }

  /**
   * [Lifecycle]
   */
  private constructor(args: IHttpClientCellArgs) {
    const { urls } = args;
    this.args = args;
    this.uri = Uri.parse<t.ICellUri>(args.uri);
    this.url = urls.cell(args.uri);
  }

  /**
   * [Fields]
   */
  private readonly args: IHttpClientCellArgs;
  private _file: t.IHttpClientCellFile;
  private _files: t.IHttpClientCellFiles;

  public readonly uri: t.IUriParts<t.ICellUri>;
  public readonly url: t.IUrlsCell;

  /**
   * [Properties]
   */
  public get file(): t.IHttpClientCellFile {
    const urls = this.args.urls;
    const http = this.args.http;
    return this._file || (this._file = HttpClientCellFile.create({ parent: this, urls, http }));
  }

  public get files(): t.IHttpClientCellFiles {
    const urls = this.args.urls;
    const http = this.args.http;
    return this._files || (this._files = HttpClientCellFiles.create({ parent: this, urls, http }));
  }

  /**
   * [Methods]
   */
  public toString() {
    return this.uri.toString();
  }

  public async exists() {
    const http = this.args.http;
    const url = this.url.info.toString();
    const res = await http.get(url);
    return res.status.toString().startsWith('2')
  }

  public async info(options: t.IUrlQueryCellInfo = {}) {
    const http = this.args.http;
    const url = this.url.info.query(options).toString();
    const res = await http.get(url);
    return util.fromHttpResponse(res).toClientResponse<t.IResGetCell>();
  }

  public async links() {
    type T = t.IHttpClientCellLinks;

    const info = await this.info();
    if (info.error) {
      const message = `Failed to get links for '${this.uri.toString()}'. ${info.error.message}`;
      return util.toError<T>(info.status, info.error.type, message);
    }

    const http = this.args.http;
    const cell = info.body.data;
    const links = cell.links || {};
    const urls = this.args.urls;
    const body = HttpClientCellLinks.create({ links, urls, http });

    return util.toClientResponse<T>(200, body);
  }
}
