import { t } from '../common';
import { bundle, bundleDeclarations } from './task.bundle';
import { cell } from './task.cell';
import { devserver } from './task.devserver';
import { watch } from './task.watch';

/**
 * Webpack bundler.
 */
export const Tasks: t.CompilerTasks = {
  bundle,
  bundleDeclarations,
  watch,
  devserver,
  cell,
};
