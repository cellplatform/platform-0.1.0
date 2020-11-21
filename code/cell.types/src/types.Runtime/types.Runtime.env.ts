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
  pull(bundle: B): Promise<void>;
  run(args: { bundle: B; params?: t.JsonMap }): Promise<void>;
};

/**
 * Runtime: node-js.
 */
export type RuntimeEnvNode = t.RuntimeMethods & { name: 'node' };

/**
 * Runtime: web (browser).
 */
export type RuntimeEnvWeb = t.RuntimeMethods & { name: 'web' };
