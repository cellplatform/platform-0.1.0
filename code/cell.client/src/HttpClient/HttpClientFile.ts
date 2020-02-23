import { t, Uri, util } from '../common';

export type IClientFileArgs = { uri: string; urls: t.IUrls; http: t.IHttp };

/**
 * HTTP client for operating on files.
 */
export class HttpClientFile implements t.IHttpClientFile {
  public static create(args: IClientFileArgs): t.IHttpClientFile {
    return new HttpClientFile(args);
  }

  /**
   * [Lifecycle]
   */
  private constructor(args: IClientFileArgs) {
    const { urls } = args;
    this.args = args;
    this.uri = Uri.parse<t.IFileUri>(args.uri);
    this.url = urls.file(args.uri);
  }

  /**
   * [Fields]
   */
  private readonly args: IClientFileArgs;
  public readonly uri: t.IUriParts<t.IFileUri>;
  public readonly url: t.IUrlsFile;

  /**
   * [Methods]
   */
  public toString() {
    return this.uri.toString();
  }

  public async info() {
    const http = this.args.http;
    const url = this.url.info;
    const res = await http.get(url.toString());
    return util.fromHttpResponse(res).toClientResponse<t.IResGetFile>();
  }
}
