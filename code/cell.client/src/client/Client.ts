import { Schema, t } from '../common';
import { ClientCell } from './ClientCell';
import { ClientFile } from './ClientFile';
import { ClientNs } from './ClientNs';

/**
 * An HTTP client for the CellOS.
 */
export class Client implements t.IClient {
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
  private readonly urls: t.IUrls;

  /**
   * [Methods]
   */
  public ns(input: string | t.IUrlParamsNs) {
    const urls = this.urls;
    const uri = urls.ns(input).uri;
    return ClientNs.create({ uri, urls });
  }

  public cell(input: string | t.IUrlParamsCell) {
    const urls = this.urls;
    const uri = urls.cell(input).uri;
    return ClientCell.create({ uri, urls });
  }

  public file(input: string | t.IUrlParamsFile) {
    const urls = this.urls;
    const uri = urls.file(input).uri;
    return ClientFile.create({ uri, urls });
  }
}
