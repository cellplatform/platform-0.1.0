import { IDisposable } from '@platform/types';
import { Observable } from 'rxjs';

export type RuntimeRemote = {
  url: string;
  namespace: string;
  entry: string;
  script(): RuntimeRemoteScript;
  module<T = any>(): Promise<T>;
  useScript: RuntimeUseScript;
};

export type RuntimeRemoteScript = IDisposable & {
  event$: Observable<IRuntimeScriptEvent>;
};

export type RuntimeUseScript = () => { ready: boolean; failed: boolean };

/**
 * Events
 */
export type RuntimeEvent = IRuntimeScriptEvent;

export type IRuntimeScriptEvent = {
  type: 'Runtime/script';
  payload: IRuntimeScript;
};
export type IRuntimeScript = {
  url: string;
  namespace: string;
  ready: boolean;
  failed: boolean;
};
