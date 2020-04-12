import { t, Uri, util } from '../common';

export type IClientNsArgs = { uri: string; urls: t.IUrls; http: t.IHttp };

/**
 * HTTP client for operating on a [Namespace].
 */
export class HttpClientNs implements t.IClientNs {
  public static create(args: IClientNsArgs): t.IClientNs {
    return new HttpClientNs(args);
  }

  /**
   * [Lifecycle]
   */
  private constructor(args: IClientNsArgs) {
    const { urls } = args;
    this.args = args;
    this.uri = Uri.parse<t.INsUri>(args.uri);
    this.url = urls.ns(args.uri);
  }

  /**
   * [Fields]
   */
  private readonly args: IClientNsArgs;
  public readonly uri: t.IUriParts<t.INsUri>;
  public readonly url: t.IUrlsNs;

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
    return res.status.toString().startsWith('2');
  }

  public async read(options: t.IUrlQueryNsInfo = {}) {
    const http = this.args.http;
    const url = this.url.info.query(options).toString();
    const res = await http.get(url);
    return util.fromHttpResponse(res).toClientResponse<t.IResGetNs>();
  }

  public async write(data: t.IReqPostNsBody, options: t.IUrlQueryNsWrite = {}) {
    const http = this.args.http;
    const url = this.url.info.query(options).toString();
    const res = await http.post(url, data);
    return util.fromHttpResponse(res).toClientResponse<t.IResPostNs>();
  }
}
