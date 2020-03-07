import { t, util } from '../common';
import { load } from './fn.load';
import { typescript } from './fn.typescript';

/**
 * Client that retrieves the type definition of a
 * namespace from the network.
 */
export class TypeClient {
  /**
   * Load types from the network using the given HTTP client.
   */
  public static client(client: string | t.IHttpClient) {
    const fetch = util.fetcher.fromClient({ client });
    return {
      load: (ns: string) => TypeClient.load({ ns, fetch }),
    };
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
