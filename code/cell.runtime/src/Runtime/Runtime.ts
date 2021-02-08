import { Uri, Urls } from '@platform/cell.schema';
import { RuntimeModule } from '../types';

const toEnv = (input?: RuntimeModule) => {
  return !input && typeof __CELL__ !== 'undefined' ? __CELL__ : input;
};

export const Runtime = {
  /**
   * Wrapper around the __CELL__ constants inserted into modules
   * by the [cell.compiler] which provides environment variables and helper
   * methods for using these constants.
   *
   * See compiler plugins:
   *    -  wp.plugin.env => [DefinePlugin]
   */
  origin(input?: RuntimeModule) {
    input = toEnv(input);
    const location = typeof window === 'object' ? window.location : undefined;
    const origin = input?.origin;
    const dev = !Boolean(origin) || (origin?.uri || '').startsWith('cell:dev:');

    if (dev) {
      Uri.ALLOW.NS = [...Uri.ALLOW.NS, 'dev'];
    }

    const host = origin?.host || location?.host || 'localhost:3000';
    const uri = origin?.uri || 'cell:dev:A1';
    const dir = trimSlash(origin?.dir || '');
    const urls = Urls.create(host);

    const path = (path: string) => {
      return dev
        ? `${urls.origin}/${trimSlash(path)}`
        : urls.cell(uri).file.byName(prepend(dir, path)).toString();
    };

    return { dev, host, uri, dir, path };
  },

  /**
   * Extract module information from __CELL__.
   */
  module(input?: RuntimeModule) {
    input = toEnv(input);
    const module: RuntimeModule['module'] = input?.module || { name: '', version: '' };
    return module;
  },
};

/**
 * Helpers
 */

const trimSlash = (path: string) => (path || '').trim().replace(/\/*$/, '').replace(/^\/*/, '');
const prepend = (dir: string, path: string) => {
  path = trimSlash(path);
  return dir ? `${dir}/${path}` : path;
};
