import { log } from './libs';
import { format } from './logger.format';

export { format };

/**
 * Log helpers for webpack.
 */
export const logger = {
  format,

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

  errors(list: { message: string }[]) {
    list.forEach((err, i) => {
      log.info.gray(`${log.red('ERROR')} ${log.yellow(i + 1)} of ${list.length}`);
      log.info(err.message);
      log.info();
    });
    return logger;
  },
};
