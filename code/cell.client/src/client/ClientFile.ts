import { t, Uri, http, util } from '../common';

export type IClientFileArgs = { uri: string; urls: t.IUrls };

/**
 * HTTP client for operating on files.
 */
export class ClientFile implements t.IClientFile {
  public static create(args: IClientFileArgs): t.IClientFile {
    return new ClientFile(args);
  }

  /**
   * [Lifecycle]
   */
  private constructor(args: IClientFileArgs) {
    const { urls } = args;
    this.urls = urls;
    this.uri = Uri.parse<t.IFileUri>(args.uri);
    this.url = urls.file(args.uri);
  }

  /**
   * [Fields]
   */
  private readonly urls: t.IUrls;

  public readonly uri: t.IUriParts<t.IFileUri>;
  public readonly url: t.IUrlsFile;

  /**
   * [Methods]
   */
  public toString() {
    return this.uri.toString();
  }

  public async info() {
    const url = this.url.info;
    const res = await http.get(url.toString());
    return util.toResponse<t.IResGetFile>(res);
  }
}
