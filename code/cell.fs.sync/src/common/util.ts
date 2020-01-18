import { open as openTarget } from './libs';
import * as t from './types';
import * as log from './util.log';

export { log };

/**
 * Retrieves the singular or plural version of a word.
 */
export function plural(singular: string, plural: string) {
  return {
    singular,
    plural,
    toString(total: number = 0) {
      total = typeof total === 'number' ? total : 0;
      return total === 1 || total === -1 ? singular : plural;
    },
  };
}

/**
 * Helpers for working with URLs.
 */
export const url = {
  stripHttp(input: string) {
    return input.replace(/^http\:\/\//, '').replace(/^https\:\/\//, '');
  },

  httpPrefix(input: string) {
    return url.stripHttp(input).startsWith('localhost') ? `http` : `https`;
  },

  withHttp(input: string) {
    if (input.startsWith('http:') || input.startsWith('https://')) {
      return input;
    } else {
      return `${url.httpPrefix(input)}://${url.stripHttp(input)}`;
    }
  },
};

/**
 * Helpers for opening parts of the configuration.
 */
export function open(config: t.IFsConfigDir) {
  return {
    local() {
      openTarget(config.dir);
    },
    remote() {
      openTarget(config.target.url);
    },
  };
}
