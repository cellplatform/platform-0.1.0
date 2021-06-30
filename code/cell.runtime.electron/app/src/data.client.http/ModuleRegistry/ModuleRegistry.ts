import { t, Uri } from './common';
import { ModuleRegistryDomain } from './ModuleRegistry.Domain';

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
     * Retrieve a Registry partitioned on a source host.
     */
    domain(domain: string) {
      const parent = uri;
      return ModuleRegistryDomain({ http, domain, parent });
    },
  };
}
