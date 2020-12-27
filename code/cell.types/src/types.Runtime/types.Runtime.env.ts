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
  run(bundle: B, options?: RuntimeRunOptions): Promise<RuntimeRunResponse>;
  remove(bundle: B): Promise<{ count: number }>;
  clear(): Promise<{ count: number }>;
};

export type RuntimeRunOptions = {
  in?: Partial<t.RuntimeIn>;
  pull?: boolean;
  silent?: boolean;
  timeout?: number;
  entry?: string; // Entry path within bundle (if not specified default manfest entry is used).
  hash?: string; // The hash of the bundle to match before executing (throws if doesn't match manifest).
};

export type RuntimePullResponse = {
  ok: boolean;
  dir: string;
  errors: t.IRuntimeError[];
  manifest: string; // Manifest URL.
};

export type RuntimeRunResponse = {
  ok: boolean;
  entry: string;
  manifest?: t.BundleManifest;
  out: t.RuntimeOut;
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
