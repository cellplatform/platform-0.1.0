import { exec } from '@platform/exec';
import { fs } from '@platform/fs';
import { log } from '@platform/log/lib/server';
import { constants } from '../app/src/main/common';
// import { upload } from '../src/main/server';

async function bundle(args: { cwd: string; targetDir: string }) {
  const { cwd, targetDir } = args;
  const run = async (cmd: string) => exec.cmd.run(cmd, { cwd, silent: true });

  const output: string[] = [];

  await exec.tasks.run([
    {
      title: 'yarn install',
      task: () => run('yarn install'),
    },
    {
      title: 'bundle',
      task: async () => {
        const res = await run('yarn bundle');
        res.info.forEach(line => output.push(line));
        return res;
      },
    },
    {
      title: `copy`,
      task: async () => {
        const sourceDir = fs.join(cwd, 'dist');
        await fs.ensureDir(targetDir);
        await fs.copy(sourceDir, targetDir);
        return { code: 0 };
      },
    },
  ]);

  log.info();
  output
    .filter(line => line.startsWith('dist/'))
    .forEach(line => {
      log.info.gray(`    • ${line}`);
    });
  log.info();
  log.info.green(`copied to: ${log.gray(targetDir)}`);
  log.info();

  return { ok: true };
}

/**
 * Run.
 */
(async () => {
  log.info();

  const base = fs.resolve('.');
  const path = constants.paths.assets.ui.substring(base.length + 1);
  const targetDir = fs.join(base, 'app', path);

  await bundle({
    cwd: fs.resolve('app.ui'),
    targetDir,
  });

  // await upload({ dir: constants.paths.assets.ui });
})();
