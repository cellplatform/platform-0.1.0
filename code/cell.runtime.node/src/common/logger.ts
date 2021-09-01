import { log } from './libs';
import { Format } from './logger.format';

export { Format };

/**
 * Log helpers for webpack.
 */
export const Logger = {
  format: Format,

  clear() {
    log.clear();
    return Logger;
  },

  newline(length = 1) {
    Array.from({ length }).forEach(() => log.info());
    return Logger;
  },

  hr(length = 60) {
    log.info.gray('━'.repeat(length));
    return Logger;
  },

  errors(list: { message: string }[]) {
    list.forEach((err, i) => {
      log.info.gray(`${log.red('ERROR')} ${log.yellow(i + 1)} of ${list.length}`);
      log.info(err.message);
      log.info();
    });
    return Logger;
  },
};
