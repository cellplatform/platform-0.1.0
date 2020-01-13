import { Schema, t, http, constants } from '../common';
import { ClientCell } from './ClientCell';
import { ClientFile } from './ClientFile';
import { ClientNs } from './ClientNs';

/**
 * An HTTP client for the CellOS.
 */
export class Client implements t.IClient {
  public static create(host?: string | number): t.IClient {
    return new Client({ host });
  }

  /**
   * [Lifecycle]
   */
  private constructor(args: { host?: string | number }) {
    this.urls = Schema.url(args.host ?? 8080);
    this.origin = this.urls.origin;
    this.http = http.create({
      headers: {
        'cell-os-client': constants.VERSION['@platform/cell.client'],
        'cell-os-schema': constants.VERSION['@platform/cell.schema'],
      },
    });
  }

  /**
   * [Fields]
   */
  public readonly origin: string;
  private readonly urls: t.IUrls;
  private readonly http: t.IHttp;

  /**
   * [Methods]
   */
  public ns(input: string | t.IUrlParamsNs) {
    const urls = this.urls;
    const uri = urls.ns(input).uri;
    const http = this.http;
    return ClientNs.create({ uri, urls, http });
  }

  public cell(input: string | t.IUrlParamsCell) {
    const urls = this.urls;
    const uri = urls.cell(input).uri;
    const http = this.http;
    return ClientCell.create({ uri, urls, http });
  }

  public file(input: string | t.IUrlParamsFile) {
    const urls = this.urls;
    const uri = urls.file(input).uri;
    const http = this.http;
    return ClientFile.create({ uri, urls, http });
  }
}
