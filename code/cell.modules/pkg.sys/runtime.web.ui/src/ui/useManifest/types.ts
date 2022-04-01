import * as t from '../../common/types';

export type UseManifestHook = (options?: { url?: string }) => ManifestHook;
export type ManifestHook = {
  is: ManifestHookFlags;
  json?: t.ModuleManifest;
  url: t.ManifestUrlParts;
  version: string;
};

export type ManifestHookFlags = {
  mock: boolean;
  localhost: boolean;
};
