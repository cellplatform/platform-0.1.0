import { Schema, t, Uri } from '../common';
import { HttpClientFile } from './HttpClientFile';

type IHttpClientCellLinksArgs = {
  links: t.ICellData['links'];
  urls: t.IUrls;
  http: t.IHttp;
};

/**
 * HTTP client for operating on a [Cell]'s links.
 */
export class HttpClientCellLinks implements t.IHttpClientCellLinks {
  public static create(args: IHttpClientCellLinksArgs): t.IHttpClientCellLinks {
    return new HttpClientCellLinks(args);
  }

  /**
   * [Lifecycle]
   */
  private constructor(args: IHttpClientCellLinksArgs) {
    const { links = {} } = args;
    this.args = args;
    this.list = Object.keys(links).map(key => this.toLink(key, links[key]));
  }

  /**
   * [Fields]
   */
  private readonly args: IHttpClientCellLinksArgs;
  public readonly list: t.IHttpClientCellLink[];

  /**
   * [Properties]
   */
  public get files() {
    return this.list.filter(item => item.type === 'FILE') as t.IHttpClientCellLinkFile[];
  }

  /**
   * [Methods]
   */
  public toObject() {
    return this.args.links;
  }

  /**
   * Helpers
   */
  private toLink(key: string, value: string): t.IHttpClientCellLink {
    const { http, urls } = this.args;
    const uri = Uri.parse(value);
    const type = uri.parts.type;

    if (type === 'FILE') {
      let file: t.IHttpClientFile | undefined;
      const link = Schema.file.links.parseLink(value);
      const uri = link.uri.toString();
      const hash = link.hash || '';
      const { name, dir, path } = Schema.file.links.parseKey(key);
      const res: t.IHttpClientCellLinkFile = {
        type: 'FILE',
        uri,
        key,
        path,
        dir,
        name,
        hash,
        get file() {
          return file || (file = HttpClientFile.create({ uri, urls, http }));
        },
      };
      return res;
    }

    // Type unknown.
    const res: t.IHttpClientCellLinkUnknown = { type: 'UNKNOWN', key, uri: value };
    return res;
  }
}
