import { log, logger, t } from '../common';
import { afterCompile, wp } from './util';

/**
 * Bundle and watch for file changes.
 */
export const watch: t.CompilerRunWatch = async (input) => {
  const { compiler, model, config: webpack } = wp.toCompiler(input);
  let count = 0;
  compiler.watch({}, (err, stats) => {
    const compilation = stats?.compilation;
    if (compilation) {
      afterCompile({ model, webpack, compilation });
    }
    count++;
    logger.clear().newline();
    log.info.gray(`Watching (${count})`);
    logger.model(model, { indent: 2, url: true }).newline().hr().stats(stats);
  });
};
