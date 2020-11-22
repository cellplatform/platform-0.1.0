import { t } from '../common';

type B = t.RuntimeBundleOrigin;

/**
 * A runtime that is capable of executing functions.
 */
export type RuntimeEnv = RuntimeEnvNode | RuntimeEnvWeb;

/**
 * Common methods of an executable runtime.
 */
export type RuntimeMethods = {
  exists(bundle: B): Promise<boolean>;
  pull(bundle: B, options?: { silent?: boolean }): Promise<{ ok: boolean; errors: Error[] }>;
  run(bundle: B, options?: { params?: t.JsonMap; silent?: boolean }): Promise<void>;

  remove(bundle: B): Promise<void>;
  clear(): Promise<void>;
};

/**
 * Runtime: node-js.
 */
export type RuntimeEnvNode = t.RuntimeMethods & { name: 'node' };

/**
 * Runtime: web (browser).
 */
export type RuntimeEnvWeb = t.RuntimeMethods & { name: 'web' };
