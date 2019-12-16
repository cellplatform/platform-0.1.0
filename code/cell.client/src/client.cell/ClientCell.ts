import { Urls, t, Uri } from '../common';

export type IClientCell = { uri: string; urls: Urls };

/**
 * An HTTP client for operating on [Cell]'s.
 */
export class ClientCell {
  public static create(args: IClientCell) {
    return new ClientCell(args);
  }

  /**
   * [Lifecycle]
   */
  private constructor(args: IClientCell) {
    this.urls = args.urls;
    this.uri = Uri.parse<t.ICellUri>(args.uri);
  }

  /**
   * [Fields]
   */
  private readonly urls: Urls;
  public readonly uri: t.IUriParts<t.ICellUri>;

  /**
   * [Methods]
   */
  public toString() {
    return this.uri.toString();
  }
}
