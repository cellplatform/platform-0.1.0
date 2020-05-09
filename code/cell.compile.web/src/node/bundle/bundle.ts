import { fs } from '@platform/fs';
import { log } from '@platform/log/lib/server';
import { copyLocal } from './bundle.copyLocal';
import { runTasks } from './bundle.runTasks';

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
