import { t } from '../common';

export type RuntimeRemote = {
  url: string;
  namespace: string;
  entry: string;
  script(): RuntimeRemoteScript;
  module<T = any>(): Promise<T>;
  useScript: RuntimeUseScript;
};

export type RuntimeRemoteScript = t.IDisposable & {
  event$: t.Observable<t.IRuntimeWebScriptEvent>;
};

export type RuntimeUseScript = () => { ready: boolean; failed: boolean };
