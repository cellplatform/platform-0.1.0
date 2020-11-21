import { t } from '../common';

export type RuntimeRemote = {
  url: string; // Remote manifest URL (eg ".../remoteEntry.js")
  namespace: string;
  entry: string; // Module name (public "export" via compiler)
};

/**
 * Web
 */
export type RuntimeRemoteWeb = t.RuntimeRemote & {
  script(): RuntimeRemoteScript;
  module<T = any>(): Promise<T>;
  useScript: RuntimeUseScript;
};

export type RuntimeRemoteScript = t.IDisposable & {
  event$: t.Observable<t.IRuntimeScriptEvent>;
};

export type RuntimeUseScript = () => { ready: boolean; failed: boolean };
