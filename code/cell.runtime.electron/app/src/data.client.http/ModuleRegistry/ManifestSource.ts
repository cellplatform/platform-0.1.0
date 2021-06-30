import { d } from './common';

type S = d.RegistryManifestSource;

/**
 * Provides meta-data about a path to a manifest.
 */
export function ManifestSource(input: string) {
  const throwError = (detail: string) => {
    throw new Error(`Invalid manifest source '${input}' - ${detail}`);
  };

  if (typeof input !== 'string') throwError('not a string');

  const manifest = (input || '').trim();
  if (!manifest) throwError('empty');

  const isHttp = manifest.startsWith('http://') || manifest.startsWith('https://');
  const kind = (isHttp ? 'url' : 'filepath') as S['kind'];

  if (!manifest.endsWith('.json')) throwError('not a path to a ".json" file');
  if (kind === 'filepath' && !manifest.startsWith('/')) throwError('filepath must start with "/"');

  return {
    manifest,
    kind,
    toObject: () => ({ manifest, kind } as S),
    toString: () => manifest,
  };
}
