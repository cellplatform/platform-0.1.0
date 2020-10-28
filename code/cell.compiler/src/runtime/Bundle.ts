import { GlobalCellEnv } from '../types/global';
import { Uri, Urls } from '@platform/cell.schema';

/**
 * Wrapper around the __CELL_ENV__ constants inserted into modules
 * by the [cell.compiler] packager, providing variables and helper
 * methods for using the variables.
 */
export const Bundle = (__CELL_ENV__?: GlobalCellEnv) => {
  const location = typeof window === 'object' ? window.location : undefined;
  const bundle = __CELL_ENV__?.bundle;
  const local = !Boolean(bundle);

  if (local) {
    Uri.ALLOW.NS = [...Uri.ALLOW.NS, 'local*'];
  }

  const host = bundle?.host || location?.host || 'localhost:3000';
  const cell = bundle?.cell || 'cell:local:A1';
  const dir = trimSlash(bundle?.dir || '');
  const urls = Urls.create(host);
  const port = urls.port;

  return {
    host: `${urls.protocol}://${urls.host}${port === 80 ? '' : `:${port}`}`,
    cell,
    dir,
    path(path: string) {
      path = (path || '').trim();
      return local ? path : urls.cell(cell).file.byName(prepend(dir, path)).toString();
    },
  };
};

/**
 * Helpers
 */

const trimSlash = (path: string) => (path || '').trim().replace(/\/*$/, '').replace(/^\/*/, '');
const prepend = (dir: string, path: string) => {
  path = trimSlash(path);
  return dir ? `${dir}/${path}` : path;
};
