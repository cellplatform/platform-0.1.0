import { t } from '../common';
import { bundle } from './task.bundle';
import { cell } from './task.cell';
import { dev } from './task.dev';
// import { upload } from './task.upload';
import { watch } from './task.watch';

/**
 * Webpack bundler.
 */
export const Tasks: t.CompilerTasks = {
  // upload,
  bundle,
  watch,
  dev,
  cell,
};
