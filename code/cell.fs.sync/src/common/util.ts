import { open as openTarget, fs, log as logger } from './libs';
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

export async function openConfig(args: { silent?: boolean } = {}) {
  const configPath = '.cell/config.yml';
  const path = fs.resolve(`${process.cwd()}/${configPath}`);
  const exists = await fs.pathExists(path);
  if (exists) {
    if (!args.silent) {
      logger.info.gray(`opening: ${configPath}`);
      logger.info();
    }
    await openTarget(path);
  }
}
