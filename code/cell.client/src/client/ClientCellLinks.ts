import { t, Uri, Schema } from '../common';
import { ClientFile } from './ClientFile';

export type IClientCellLinksArgs = { links: t.ICellData['links']; urls: t.IUrls };

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
    const { links = {} } = args;
    this.args = args;
    this.list = Object.keys(links).map(key => this.toLink(key, links[key]));
  }

  /**
   * [Fields]
   */

  private readonly args: IClientCellLinksArgs;
  public readonly list: t.IClientCellLink[];

  /**
   * [Properties]
   */

  public get files() {
    return this.list.filter(item => item.type === 'FILE') as t.IClientCellLinkFile[];
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
  private toLink(key: string, value: string): t.IClientCellLink {
    const urls = this.args.urls;
    const uri = Uri.parse(value);
    const type = uri.parts.type;

    if (type === 'FILE') {
      let file: t.IClientFile | undefined;
      const { uri, hash } = Schema.file.links.parseLink(value);
      const { name, dir, path } = Schema.file.links.toFilename(key);
      const res: t.IClientCellLinkFile = {
        type: 'FILE',
        uri,
        key,
        name,
        dir,
        path,
        hash,
        get file() {
          return file || (file = ClientFile.create({ uri, urls }));
        },
      };
      return res;
    }

    // Type unknown.
    const res: t.IClientCellLinkUnknown = { type: 'UNKNOWN', key, uri: value };
    return res;
  }
}
