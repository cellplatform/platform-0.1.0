import { exec } from '@platform/exec';
import { fs } from '@platform/fs';
import { log } from '@platform/log/lib/server';
import { copyLocal } from './bundle.copyLocal';

/**
 * Copies the source files module from [node_modules] for the given module
 * and bundles it (using "parceljs"), copying the given target.
 */
export const bundle = async (args: {
  sourceDir: string;
  targetDir: string;
  distDir?: string;
  silent?: boolean;
}) => {
  const { sourceDir, targetDir, distDir = 'dist', silent } = args;
  const copy = await copyLocal({ sourceDir });

  if (!silent) {
    log.info();
    log.info.gray(`  module:            ${log.white(fs.basename(copy.sourceDir))}`);
    log.info.gray(`  source:            ${copy.sourceDir}`);
    log.info.gray(`  build from: (${log.cyan('cwd')})  ${copy.targetDir}`);
    log.info.gray(`  output to:  (${log.magenta('out')})  ${targetDir}`);
    log.info();
  }

  const tasks = await runTasks({
    sourceDir: copy.targetDir,
    sourceDist: distDir,
    targetDir,
    silent,
  });

  const { ok } = tasks;
  return { ok };
};

/**
 * [Internal]
 */

async function runTasks(args: {
  sourceDir: string;
  sourceDist: string;
  targetDir: string;
  silent?: boolean;
}) {
  const { sourceDir, targetDir, silent } = args;
  const cwd = sourceDir;
  const dirname = fs.basename(cwd);

  const run = async (cmd: string) => exec.cmd.run(cmd, { cwd, silent: true });

  const done = (ok: boolean) => {
    return { ok };
  };

  if (!(await fs.pathExists(sourceDir))) {
    log.error(`FAIL: source directory does not exist.`);
    log.info.gray(sourceDir);
    log.info();
    return done(false);
  }

  const output: string[] = [];

  await exec.tasks.run(
    [
      {
        title: log.gray(`${log.cyan('cwd')}: ${dirname}/${log.white('yarn install')}`),
        task: () => run('yarn install'),
      },
      {
        title: log.gray(`${log.cyan('cwd')}: ${dirname}/${log.white('yarn bundle')}`),
        task: async () => {
          const res = await run('yarn bundle');
          res.info.forEach(line => output.push(line));
          return res;
        },
      },
      {
        title: log.gray(`${log.magenta('out')}: copy bundle`),
        task: async () => {
          const from = fs.join(cwd, args.sourceDist);
          const to = targetDir;
          if (await fs.pathExists(from)) {
            await fs.remove(to);
            await fs.ensureDir(to);
            await fs.copy(from, to);
          }
          return { code: 0 };
        },
      },
    ],
    { silent },
  );

  if (!silent) {
    const files = await fs.readdir(targetDir);
    const size = (await fs.size.dir(targetDir)).toString();

    output
      .filter(line => line.startsWith('dist/'))
      .forEach(line => {
        log.info.gray(`    • ${line}`);
      });
    log.info();
    log.info.green(`copied:`);
    log.info.gray(` • ${files.length} files (${log.blue(size)})`);
    log.info.gray(` • ${targetDir}`);
    log.info();
  }

  return done(true);
}
