import { Uri, Urls } from '@platform/cell.schema';
import { RuntimeEnv } from '../types';

import { remote } from './remote';

const toEnv = (input?: RuntimeEnv) => {
  return !input && typeof __CELL_ENV__ !== 'undefined' ? __CELL_ENV__ : input;
};

export const Runtime = {
  remote,

  /**
   * Wrapper around the __CELL_ENV__ constants inserted into modules
   * by the [cell.compiler] packager, providing variables and helper
   * methods for using the variables.
   *
   * See compiler plugins:
   *    -  wp.plugin.env => [DefinePlugin]
   */
  bundle(input?: RuntimeEnv) {
    input = toEnv(input);
    const location = typeof window === 'object' ? window.location : undefined;
    const bundle = input?.bundle;
    const dev = !Boolean(bundle) || (bundle?.cell || '').startsWith('cell:dev:');

    if (dev) {
      Uri.ALLOW.NS = [...Uri.ALLOW.NS, 'dev'];
    }

    const hostname = bundle?.host || location?.host || 'localhost:3000';
    const cell = bundle?.cell || 'cell:dev:A1';
    const dir = trimSlash(bundle?.dir || '');
    const urls = Urls.create(hostname);
    const port = urls.port;
    const host = `${urls.protocol}://${urls.host}${port === 80 ? '' : `:${port}`}`;

    const path = (path: string) =>
      dev
        ? `${host}/${trimSlash(path)}`
        : urls.cell(cell).file.byName(prepend(dir, path)).toString();

    return { dev, host, cell, dir, path };
  },

  /**
   * Extract module information from __CELL_ENV__.
   */
  module(input?: RuntimeEnv) {
    input = toEnv(input);
    const module: RuntimeEnv['module'] = input?.module || { name: '', version: '' };
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
