import { t, Uri } from './common';
import { Clean } from './util';

/**
 * Handles storing module regsitry data for a single namespace.
 */
export function ModuleRegistryNamespace(args: {
  http: t.IHttpClient;
  namespace: string;
  domain: { name: string; uri: string };
}) {
  const { domain } = args;
  const namespace = Clean.namespace(args.namespace, { throw: true });

  return {
    namespace,
    domain,
  };
}

/**
 * - host
 * - namespace
 * - verion
 */
