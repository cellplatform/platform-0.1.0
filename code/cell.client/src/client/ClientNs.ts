import { t, Uri, Schema } from '../common';
import { ClientFile } from './ClientFile';

export type IClientNsArgs = { uri: string; urls: t.IUrls };

/**
 * HTTP client for operating on a [Namespace].
 */
export class ClientNs implements t.IClientNs {
  public static create(args: IClientNsArgs): t.IClientNs {
    return new ClientNs(args);
  }

  /**
   * [Lifecycle]
   */
  private constructor(args: IClientNsArgs) {
    const { urls } = args;
    this.args = args;
    this.uri = Uri.parse<t.INsUri>(args.uri);
    this.url = urls.ns(args.uri);
  }

  /**
   * [Fields]
   */
  private readonly args: IClientNsArgs;

  public readonly uri: t.IUriParts<t.INsUri>;
  public readonly url: t.IUrlsNs;

  /**
   * [Methods]
   */
  public toString() {
    return this.uri.toString();
  }
}
