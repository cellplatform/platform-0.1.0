import { t } from '../common';
import { bundle } from './task.bundle';
import { bundleDeclarations } from './task.bundle.declarations';
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
};
