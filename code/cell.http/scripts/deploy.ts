import { fs, log } from './common';
import * as minimist from 'minimist';
import { exec } from '@platform/exec';

const argv = minimist(process.argv.slice(2));
const path = fs.resolve(argv._[0] || '');

const FILES = [
  'package.json',
  'now.json',
  'yarn.lock',
  'src/common.ts',
  'src/now.ts',
  'src/types.ts',
];

/**
 * Make a copy of the deployment folder.
 */
async function copy(args: { sourceDir: string; targetDir: string }) {
  // Create base directory.
  const sourceDir = fs.resolve(args.sourceDir);
  const targetDir = fs.resolve(args.targetDir);
  await fs.ensureDir(targetDir);

  // Copy files.
  const files = FILES.map(path => {
    const from = fs.join(sourceDir, path);
    const to = fs.join(targetDir, path);
    return { from, to };
  });
  await Promise.all(files.map(({ from, to }) => fs.copy(from, to)));

  // Finish up.
  return { files };
}

/**
 * Prepare and run a deployment.
 */
async function deploy(args: { silent?: boolean } = {}) {
  // const dir =
  const sourceDir = fs.resolve('src.sample');
  const targetDir = fs.resolve('tmp/.deploy');
  await copy({ sourceDir, targetDir });

  // Deploy.
  const cmd = exec.command('yarn deploy');

  const running = cmd.run({ cwd: targetDir, silent: true });
  if (!args.silent) {
    running.output$.subscribe(e => log.info(e.text));
  }

  await running;
}

/**
 * Run.
 */
(async () => deploy())();
