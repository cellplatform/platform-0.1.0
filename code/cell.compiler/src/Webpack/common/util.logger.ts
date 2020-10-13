import { Compilation as ICompliation, Stats as IStats } from 'webpack';
import { stats } from '../config.wp/wp.stats';

import { t, log, DEFAULT } from '../common';

/**
 * Log helpers for webpack.
 */
export const logger = {
  clear() {
    log.clear();
    return logger;
  },

  newline(length = 1) {
    Array.from({ length }).forEach(() => log.info());
    return logger;
  },

  hr(length = 60) {
    log.info.gray('━'.repeat(length));
    return logger;
  },

  stats(input?: IStats | ICompliation) {
    stats(input).log();
    return logger;
  },

  model(model: t.WebpackModel, indent?: number) {
    const prefix = typeof indent === 'number' ? ' '.repeat(indent) : '';
    const host = model.host || DEFAULT.CONFIG.host;
    const port = model.port || DEFAULT.CONFIG.port;
    log.info(`${prefix}name: ${log.green(model.name)}`);
    log.info(`${prefix}mode: ${log.green(model.mode)}`);
    log.info(`${prefix}host: ${log.cyan(host)}:${log.magenta(port)}`);
    return logger;
  },
};
