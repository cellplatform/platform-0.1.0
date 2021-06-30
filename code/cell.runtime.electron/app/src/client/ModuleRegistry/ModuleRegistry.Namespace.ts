import { t, Uri } from './common';
import { Clean } from './util';

/**
 * Handles storing module regsitry data for a single namespace.
 */
export function ModuleRegistryNamespace(args: {
  http: t.IHttpClient;
  namespace: string;
  host: { name: string; uri: string };
}) {
  const { host } = args;
  const namespace = Clean.namespace(args.namespace, { throw: true });

  return {
    namespace,
    host,
  };
}

/**
 * - host
 * - namespace
 * - verion
 */
