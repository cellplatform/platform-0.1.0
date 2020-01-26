import { cli } from '@platform/cli';
const { fs, prompt, log } = cli;

(async () => {
  const dirs = await promptDirs('demo');
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

/**
 * Prompt user for selection of a directory.
 */
async function promptDirs(dir: string) {
  const paths = await fs.glob.find(fs.join(fs.resolve(dir), '*/package.json'));
  const items = paths.map(path => {
    const dir = fs.dirname(path);
    const name = fs.basename(dir);
    return {
      name: log.gray(`• demo/${log.white(name)}/`),
      value: dir,
    };
  });

  const res = await prompt.list({
    message: 'folder',
    items: ['all', '---', ...items],
  });

  return res === 'all' ? items.map(item => item.value) : [res];
}
