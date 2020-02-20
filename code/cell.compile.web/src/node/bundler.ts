import { exec } from '@platform/exec';
import { fs } from '@platform/fs';
import { log } from '@platform/log/lib/server';

/**
 * Copies the source files module from [node_modules] for the given module
 * and bundles it (using "parceljs"), copying the given target.
 */
export const bundle = async (args: {
  moduleName: string;
  targetDir: string;
  distDir?: string;
  silent?: boolean;
}) => {
  const { moduleName, targetDir, distDir = 'dist', silent } = args;
  const copy = await copyLocal({ moduleName });

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

  const run = async (cmd: string) => exec.cmd.run(cmd, { cwd, silent: true });

  const done = (ok: boolean) => {
    return { ok };
  };

  if (!silent) {
    log.info.gray(`source: ${sourceDir}`);
    log.info.gray(`target: ${targetDir}`);
    log.info();
  }

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
          const from = fs.join(cwd, args.sourceDist);
          const to = targetDir;
          await fs.remove(to);
          await fs.ensureDir(to);
          await fs.copy(from, to);
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

const copyLocal = async (args: { moduleName: string }) => {
  const { moduleName } = args;
  const sourceDir = fs.resolve(fs.join('app/node_modules', moduleName));
  const targetDir = fs.resolve(`tmp/${moduleName}`);
  await fs.ensureDir(targetDir);

  const copy = async (path: string) => {
    const from = fs.join(sourceDir, path);
    const to = fs.join(targetDir, path);
    await fs.copy(from, to);
  };

  const files = ['package.json', 'yarn.lock', 'src'];
  await Promise.all(files.map(copy));

  return { files, sourceDir, targetDir };
};
