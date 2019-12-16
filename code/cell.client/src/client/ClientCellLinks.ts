import { t } from '../common';

export type IClientCellLinksArgs = { parent: t.IClientCell; urls: t.IUrls };

/**
 * HTTP client for operating on a [Cell]'s links.
 */
export class ClientCellLinks implements t.IClientCellLinks {
  public static create(args: IClientCellLinksArgs): t.IClientCellLinks {
    return new ClientCellLinks(args);
  }

  /**
   * [Lifecycle]
   */
  private constructor(args: IClientCellLinksArgs) {
    this.urls = args.urls;
    this.parent = args.parent;
  }

  /**
   * [Fields]
   */
  private readonly urls: t.IUrls;
  private readonly parent: t.IClientCell;
}
