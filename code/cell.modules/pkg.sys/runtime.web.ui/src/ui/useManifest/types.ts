import * as t from '../../common/types';

export type UseManifestHook = (options?: {
  url?: string;
  onLoaded?: ManifestHookLoadedHandler;
}) => ManifestHook;

export type ManifestHookLoadedHandler = (e: ManifestHookLoadedHandlerArgs) => void;
export type ManifestHookLoadedHandlerArgs = {
  json: t.ModuleManifest;
  is: t.ManifestHookFlags;
  url: string;
};

export type ManifestHook = {
  is: ManifestHookFlags;
  json?: t.ModuleManifest;
  url: string;
  version: string;
};

export type ManifestHookFlags = {
  loaded: boolean;
  mock: boolean;
  localhost: boolean;
};
