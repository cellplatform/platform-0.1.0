import { t, http, Schema, Urls } from '../common';
import { ClientCell } from '../client.cell';

type F = t.IFetchOptions;

/**
 * An HTTP client for the CellOS.
 */
export class Client {
  public static create(host?: string | number) {
    return new Client({ host });
  }

  /**
   * [Lifecycle]
   */
  private constructor(args: { host?: string | number }) {
    this.urls = Schema.url(args.host ?? 8080);
    this.origin = this.urls.origin;
  }

  /**
   * [Fields]
   */
  public readonly origin: string;
  private readonly urls: Urls;

  /**
   * [Methods]
   */
  public cell(input: string | t.IUrlParamsCell) {
    const urls = this.urls;
    const uri = urls.cell(input).uri;
    return ClientCell.create({ uri, urls });
  }
}
