import { Uri, Urls } from '@platform/cell.schema';
import { RuntimeBundle } from '../types';

import { remote } from './remote';

const toEnv = (input?: RuntimeBundle) => {
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
  origin(input?: RuntimeBundle) {
    input = toEnv(input);
    const location = typeof window === 'object' ? window.location : undefined;
    const origin = input?.origin;
    const dev = !Boolean(origin) || (origin?.cell || '').startsWith('cell:dev:');

    if (dev) {
      Uri.ALLOW.NS = [...Uri.ALLOW.NS, 'dev'];
    }

    const hostname = origin?.host || location?.host || 'localhost:3000';
    const cell = origin?.cell || 'cell:dev:A1';
    const dir = trimSlash(origin?.dir || '');
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
  module(input?: RuntimeBundle) {
    input = toEnv(input);
    const module: RuntimeBundle['module'] = input?.module || { name: '', version: '' };
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
