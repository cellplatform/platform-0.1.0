import { cli } from '@platform/cli';
const { fs, log } = cli;

(async () => {
  const dirs = await cli.prompt.fs.paths('demo').checkbox();
  const info: string[] = [];
  const errors: string[] = [];
  const tasks = cli.tasks();

  dirs.forEach(dir => {
    const dirname = fs.basename(dir);
    const title = log.gray(`bundle: ${log.white(dirname)}`);
    tasks.task(title, async () => {
      const res = await cli.exec.command(`yarn bundle`).run({ cwd: dir, silent: true });
      info.push(`${log.green(title)}`);
      res.info
        .filter(line => line.startsWith('dist/'))
        .forEach(line => info.push(`  ${log.gray(line)}`));
      info.push('');

      if (res.error) {
        res.errors.forEach(line => errors.push(`${log.white(dirname)} ${line}`));
        throw res.error;
      }
    });
  });

  log.info();
  const res = await tasks.run({ concurrent: true });

  log.info();
  info.forEach(line => cli.log.info(line));

  if (errors.length > 0) {
    errors.forEach(line => cli.log.error(line));

    // log.error(error);
  }
})();
