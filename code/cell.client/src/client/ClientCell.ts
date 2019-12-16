import { Urls, t, Uri, FormData, http } from '../common';

export type IClientCellArgs = { uri: string; urls: t.IUrls };

/**
 * An HTTP client for operating on [Cell]'s.
 */
export class ClientCell {
  public static create(args: IClientCellArgs) {
    return new ClientCell(args);
  }

  /**
   * [Lifecycle]
   */
  private constructor(args: IClientCellArgs) {
    this.uri = Uri.parse<t.ICellUri>(args.uri);
    this.urls = args.urls;
    this.url = this.urls.cell(args.uri);
  }

  /**
   * [Fields]
   */
  private readonly urls: t.IUrls;
  private readonly url: t.IUrlsCell;
  public readonly uri: t.IUriParts<t.ICellUri>;

  /**
   * [Properties]
   */

  public get file() {
    const fileUrl = this.url.file;
    return {
      /**
       * Upload a file and associate it with the cell.
       */
      async post(args: { filename: string; data: ArrayBuffer }) {
        // Prepare the form data.
        const form = new FormData();
        form.append('file', args.data, { contentType: 'application/octet-stream' });
        const headers = form.getHeaders();

        // POST to the service.
        const url = fileUrl.byName(args.filename);
        const res = await http.post(url.toString(), form, { headers });
        const json = res.json<t.IResPostCellFile>();

        // Finish up.
        const { ok, status } = res;
        return { ok, status, json };
      },
    };
  }

  /**
   * [Methods]
   */
  public toString() {
    return this.uri.toString();
  }
}
