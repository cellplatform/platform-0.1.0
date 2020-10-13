import { Compilation as ICompliation, Stats as IStats } from 'webpack';
import { stats } from '../config.wp/wp.stats';

import { toTargetArray, t, log, DEFAULT } from '../common';

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
    const target = toTargetArray(model.target);

    const table = log.table({ border: false });
    const add = (key: string, value: string) => {
      const left = log.gray(`${prefix}${log.white(key)}: `);
      table.add([left, value]);
    };

    add('name', log.green(model.name));
    add('mode', log.green(model.mode));
    add('target', log.green(target.join()));
    add('host', log.green(`${log.cyan(host)}:${log.magenta(port)}`));

    table.log();

    return logger;
  },
};
