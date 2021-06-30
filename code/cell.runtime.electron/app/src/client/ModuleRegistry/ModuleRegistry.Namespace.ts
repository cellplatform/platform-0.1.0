import { t, Uri } from './common';
import { Clean } from './util';

/**
 * Handles storing module registry data for a single namespace.
 */
export function ModuleRegistryNamespace(args: {
  http: t.IHttpClient;
  namespace: string;
  domain: { name: string; uri: string };
}) {
  const { http, domain } = args;
  const namespace = Clean.namespace(args.namespace, { throw: true });

  const cell = http.cell(domain.uri);

  // const info = await cell.info()

  return {
    namespace,
    domain,

    async versions() {
      
    }
  };
}

/**
 * - host
 * - namespace
 * - verion
 */
