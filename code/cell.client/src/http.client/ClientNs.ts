import { t, Uri, util } from '../common';

export type IClientNsArgs = { uri: string; urls: t.IUrls; http: t.IHttp };

/**
 * HTTP client for operating on a [Namespace].
 */
export class ClientNs implements t.IClientNs {
  public static create(args: IClientNsArgs): t.IClientNs {
    return new ClientNs(args);
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

  public async read(options?: t.IUrlQueryNsInfo) {
    const http = this.args.http;
    const url = this.url.info.query(options || {});
    const res = await http.get(url.toString());
    return util.fromHttpResponse(res).toClientResponse<t.IResGetNs>();
  }
}
