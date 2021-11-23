import { t } from '../common';
import { parse } from './ManifestUrl.parse';

type Path = string;

/**
 * Remote entry URL.
 */
export function toRemoteEntryUrl(
  url: t.ManifestUrlParts | string,
  manifest: t.ModuleManifest | undefined,
) {
  if (!manifest) return '';

  const parts = typeof url === 'string' ? parse(url) : url;
  if (parts.error) throw new Error(`Failed to derive remote-entry URL. ${parts.error}`);

  const entry = (manifest?.module?.remote?.entry || '').trim();
  if (!entry) return '';

  let res = `${parts.protocol}://${parts.domain}`;
  if (parts.dir) res = `${res}/${parts.dir}`;
  return `${res}/${manifest?.module?.remote?.entry || ''}`;
}

/**
 * Remote import.
 */
export function toRemoteImport(
  url: t.ManifestUrlParts | string,
  manifest: t.ModuleManifest,
  entry: Path,
): t.ModuleManifestRemoteImport {
  return {
    url: toRemoteEntryUrl(url, manifest),
    namespace: manifest?.module?.namespace || '',
    entry,
  };
}
