import { cli } from '@platform/cli';
const { log, fs } = cli;

(async () => {
  const cwd = (await cli.prompt.fs.paths('demo').radio())[0];
  if (!cwd) {
    return log.gray('nothing selected');
  } else {
    log.info();
    log.info(fs.basename(cwd));
    await cli.exec.command('yarn serve --open').run({ cwd });
  }
})();
