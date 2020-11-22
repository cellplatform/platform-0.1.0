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
  pull(bundle: B, options?: { silent?: boolean }): Promise<RuntimePullResponse>;
  run(
    bundle: B,
    options?: { params?: t.JsonMap; pull?: boolean; silent?: boolean },
  ): Promise<RuntimeRunResponse>;

  remove(bundle: B): Promise<{ count: number }>;
  clear(): Promise<{ count: number }>;
};

export type RuntimePullResponse = {
  ok: boolean;
  errors: Error[];
  dir: string;
};

export type RuntimeRunResponse = {
  ok: boolean;
  errors: Error[];
};

/**
 * Runtime: node-js.
 */
export type RuntimeEnvNode = t.RuntimeMethods & { name: 'node' };

/**
 * Runtime: web (browser).
 */
export type RuntimeEnvWeb = t.RuntimeMethods & { name: 'web' };
