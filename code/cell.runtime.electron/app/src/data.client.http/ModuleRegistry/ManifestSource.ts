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

  const path = (input || '').trim();
  if (!path) throwError('empty');

  const isHttp = path.startsWith('http://') || path.startsWith('https://');
  const kind = (isHttp ? 'url' : 'filepath') as S['kind'];

  if (!path.endsWith('.json')) throwError('not a path to a ".json" file');
  if (kind === 'filepath' && !path.startsWith('/')) throwError('filepath must start with "/"');

  return {
    path,
    kind,
    toObject: () => ({ manifest: path, kind } as S),
    toString: () => path,
  };
}
