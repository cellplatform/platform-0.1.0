import { parse } from './ManifestUrl.parse';
import { params } from './ManifestUrl.params';
import { toRemoteEntryUrl, toRemoteImport } from './ManifestUrl.remoteEntry';

export const ManifestUrl = {
  parse,
  params,
  toRemoteEntryUrl,
  toRemoteImport,
};
