import { t } from '../common';

type B = t.RuntimeBundleOrigin;

/**
 * A runtime that is capable of executing functions.
 */
export type RuntimeEnv = RuntimeEnvNode | RuntimeEnvWeb;

/**
 * Common methods of an executable runtime.
 */
type RuntimeMembers = {
  version: string;
  exists(bundle: B): Promise<boolean>;
  pull(bundle: B, options?: { silent?: boolean }): Promise<RuntimePullResponse>;
  run(
    bundle: B,
    options?: { params?: t.JsonMap; pull?: boolean; silent?: boolean; timeout?: number },
  ): Promise<RuntimeRunResponse>;

  remove(bundle: B): Promise<{ count: number }>;
  clear(): Promise<{ count: number }>;
};

export type RuntimePullResponse = {
  ok: boolean;
  dir: string;
  errors: t.IRuntimeError[];
  manifest: string; // Manifest URL.
};

export type RuntimeRunResponse = {
  ok: boolean;
  manifest?: t.BundleManifest;
  result?: t.JsonMap;
  errors: t.IRuntimeError[];
  elapsed: { prep: number; run: number };
};

export type RuntimeElapsed = {
  prep: number; // Preparation time (in msecs) - eg: pull/compile.
  run: number; // Execution time (in msecs)
};

/**
 * Runtime: node-js.
 */
export type RuntimeEnvNode = RuntimeMembers & { name: 'node' };

/**
 * Runtime: web (browser).
 */
export type RuntimeEnvWeb = RuntimeMembers & { name: 'web' };
