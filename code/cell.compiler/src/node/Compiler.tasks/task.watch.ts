import { log, t } from '../common';
import { logger, wp } from './util';

/**
 * Bundle and watch for file changes.
 */
export const watch: t.CompilerRunWatch = async (input) => {
  const { compiler, model } = wp.toCompiler(input);
  let count = 0;
  compiler.watch({}, (err, stats) => {
    count++;
    logger.clear().newline();
    log.info.gray(`Watching (${count})`);
    logger.model(model, 2).newline().hr().stats(stats);
  });
};