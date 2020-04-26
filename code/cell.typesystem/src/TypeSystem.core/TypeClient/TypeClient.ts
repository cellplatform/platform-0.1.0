import { t } from '../../common';
import { util } from '../../util';
import { load } from './TypeClient.fn.load';
import { typescript } from './TypeClient.fn.typescript';

/**
 * Client that retrieves the type definition of a
 * namespace from the network.
 */
export class TypeClient {
  /**
   * Load types from the network using the given HTTP client.
   */
  public static client(client: t.IHttpClient) {
    const fetch = util.fetcher.fromClient(client);
    const api = {
      load: (ns: string | t.INsUri) => TypeClient.load({ ns, fetch }),
    };
    return api;
  }

  /**
   * Retrieve and assemble types from the network.
   */
  public static load = load;

  /**
   * Converts type definitions to valid typescript declarations.
   */
  public static typescript = typescript;
}
