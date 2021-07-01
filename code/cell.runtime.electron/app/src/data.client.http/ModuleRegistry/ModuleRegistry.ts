import { d, t, Uri, Schema } from './common';
import { ModuleRegistryDomain } from './ModuleRegistry.Domain';
import { Encoding } from './util';

/**
 * Client for reading/writing data about installed modules.
 */
export function ModuleRegistry(args: {
  http: t.IHttpClient; // HTTP client for the origin server.
  uri: t.ICellUri | string; // Base cell being used as the ModuleRegistry index.
}) {
  const { http } = args;
  const uri = Uri.cell(args.uri, true);
  return {
    uri,

    /**
     * Retrieve a list of all [domains] within the registry.
     */
    async domains() {
      const cell = http.cell(uri);
      const links = (await cell.links.read()).body;
      return links.cells
        .map((link) => link.key)
        .filter(Encoding.domainKey.is)
        .map(Encoding.domainKey.unescape);
    },

    /**
     * Retrieve a Registry partitioned on a source host.
     */
    domain(domain: string) {
      const parent = uri;
      return ModuleRegistryDomain({ http, domain, parent });
    },
  };
}
