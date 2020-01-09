import { FormData, t, Uri, http, util } from '../common';

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
    const url = this.url.info;
    const res = await http.get(url.toString());
    return util.toResponse<t.IResGetFile>(res);
  }

  /**
   * TODO 🐷
   * - DELETE upload direct on file (done via /files)
   * - Remove URL builder
   * - Remove HTTP endpoint.
   */

  public async upload(args: { filename: string; data: ArrayBuffer }) {
    const { filename, data } = args;

    // Prepare the form data.
    const form = new FormData();
    form.append('file', data, {
      filename,
      contentType: 'application/octet-stream',
    });

    // POST to the service.
    const url = this.url.upload;
    const headers = form.getHeaders();
    const res = await http.post(url.toString(), form, { headers });

    // Finish up.
    return util.toResponse<t.IResPostFile>(res);
  }

  public async delete() {
    const url = this.url.delete;
    const res = await http.delete(url.toString());
    return util.toResponse<t.IResDeleteFile>(res);
  }
}
