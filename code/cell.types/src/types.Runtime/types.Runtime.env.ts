import { t } from '../common';

type Id = string;

/**
 * A runtime that is capable of executing functions.
 */
export type RuntimeEnv = t.RuntimeEnvNode | t.RuntimeEnvWeb;

export type RuntimeElapsed = {
  prep: number; // Preparation time (in msecs) - eg: pull/compile.
  run: number; //  Execution time (in msecs)
};

/**
 * Common methods of an executable runtime.
 */
export type RuntimeMembers = {
  version: string;
  exists: RuntimeExists;
  pull: RuntimePull;
  run: RuntimeRun;
  remove: RuntimeRemove;
  clear: RuntimeClear;
};

export type RuntimeExists = (url: t.ManifestUrl) => Promise<boolean>;
export type RuntimePull = (
  url: t.ManifestUrl,
  options?: { silent?: boolean },
) => Promise<RuntimePullResponse>;
export type RuntimeRun = (url: t.ManifestUrl, options?: RuntimeRunOptions) => RuntimeRunPromise;
export type RuntimeRemove = (url: t.ManifestUrl) => Promise<RuntimeRemoveResponse>;
export type RuntimeClear = () => Promise<RuntimeClearResponse>;

/**
 * Pull
 */
export type RuntimePullResponse = {
  ok: boolean;
  dir: string;
  bundle: { url: t.ManifestUrl; manifest?: t.ModuleManifest };
  errors: t.IRuntimeError[];
};

/**
 * Run
 */
export type RuntimeRunStage = 'started' | 'completed:ok' | 'completed:error' | 'killed';
export type RuntimeRunLifecycle = { stage: RuntimeRunStage; is: { ok: boolean; ended: boolean } };

export type RuntimeRunOptions = {
  in?: Partial<t.RuntimeIn>;
  pull?: boolean;
  silent?: boolean;
  timeout?: number | 'never';
  entry?: string; // Entry path within bundle (if not specified default manfest entry is used).
  fileshash?: string; // The hash of the bundle to match before executing (throws if doesn't match manifest).
};

export type RuntimeRunResponse = {
  tx: Id;
  ok: boolean;
  entry: string;
  manifest?: t.ModuleManifest;
  out: t.RuntimeOut;
  errors: t.IRuntimeError[];
  elapsed: { prep: number; run: number };
  timeout: t.Timeout;
};

export type RuntimeRunPromise = Promise<RuntimeRunResponse> & {
  tx: Id;
  lifecyle$: t.Observable<RuntimeRunLifecycle>;
  start$: t.Observable<RuntimeRunLifecycle>;
  end$: t.Observable<RuntimeRunLifecycle>;
};

/**
 * Remove/Clear
 */
export type RuntimeRemoveResponse = { count: number };
export type RuntimeClearResponse = { count: number };
