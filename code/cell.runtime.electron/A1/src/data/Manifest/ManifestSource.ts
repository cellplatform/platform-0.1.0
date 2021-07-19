import { t } from './common';

/**
 * Parses a source string to a manifest-file
 * providing meta-data about the path.
 */
export function ManifestSource(input: string): t.ManifestSource {
  const throwError = (detail: string) => {
    throw new Error(`Invalid manifest source '${input}' - ${detail}`);
  };

  if (typeof input !== 'string') throwError('not a string');

  const path = (input || '').trim();
  if (!path) throwError('empty');

  const isHttp = path.startsWith('http://') || path.startsWith('https://');
  const kind = (isHttp ? 'url' : 'filepath') as t.ManifestSourceKind;

  if (!path.endsWith('.json')) throwError('not a path to a ".json" file');
  if (kind === 'filepath') {
    if (!path.startsWith('/')) throwError('filepath must start with "/"');
  }
  if (kind === 'url') {
    const { pathname } = new URL(path);
    if (!pathname.startsWith('/cell:')) throwError('not a [cell] uri');
    if (pathname.indexOf('/fs/') < 0) throwError('not a cell filesystem path');
  }

  return {
    path,
    kind,
    toString: () => path,

    get domain() {
      return kind === 'filepath' ? 'runtime:electron:bundle' : new URL(path).host;
    },

    get dir() {
      if (kind === 'filepath') {
        return path.substring(0, path.lastIndexOf('/'));
      }
      if (kind === 'url') {
        const { pathname } = new URL(path);
        const start = pathname.indexOf('/fs/') + 3;
        const end = pathname.lastIndexOf('/');
        return start < 0 ? '' : pathname.substring(start, end);
      }
      throw new Error(`Kind '${kind}' not supported`);
    },
  };
}
