import { t } from '../common';

type RemoteEntryUrl = string;
type Path = string;

export type RuntimeRemote = {
  url: RemoteEntryUrl; // Remote [FederatedModule] entry script (eg ".../remoteEntry.js").
  namespace: string; //   The encoded [FederatedModule] namespace "scope".
  entry: Path; //         Module name (public "export" via compiler).
};

/**
 * Web
 */
export type RuntimeRemoteWeb = t.RuntimeRemote & {
  script(): RuntimeRemoteScript;
  module<M = any>(): Promise<M>;
  useModule<M = any>(): RuntimeRemoteModule<M>;
};

export type RuntimeRemoteScript = t.Disposable & {
  $: t.Observable<t.RuntimeWebScriptEvent>;
  ready: Promise<t.RuntimeWebScript>;
};

export type RuntimeRemoteModule<M = any> = {
  ready: boolean;
  failed: boolean;
  module?: M;
};

/**
 * TODO 🐷 TEMP
 */

export type RuntimeBundleOrigin___TEMP = {
  host: string;
  uri: string;
  dir?: string;
};
