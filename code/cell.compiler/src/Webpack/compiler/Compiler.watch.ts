import { log, t, logger } from '../common';
import * as util from './util';

/**
 * Bundle and watch for file changes.
 */
export const watch: t.WebpackWatch = async (input) => {
  const { compiler, model } = util.toCompiler(input);
  let count = 0;
  compiler.watch({}, (err, stats) => {
    count++;
    logger.clear().newline();
    log.info.gray(`Watching (${count})`);
    logger.model(model, 2).newline().hr().stats(stats);
  });
};
