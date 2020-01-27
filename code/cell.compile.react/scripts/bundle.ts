import { cli } from '@platform/cli';
const { fs, log } = cli;

(async () => {
  const dirs = await cli.prompt.fs.paths('demo').checkbox();
  const info: string[] = [];

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
    });
  });

  log.info();
  const res = await tasks.run({ concurrent: true });

  log.info();
  info.forEach(line => cli.log.info(line));
})();
