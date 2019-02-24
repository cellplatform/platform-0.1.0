import { fs } from '@platform/fs';

/**
 * Remove generated files.
 */
const dirs = ['.cache', '.dev', '.uiharness', 'lib'];
dirs.forEach(dir => fs.removeSync(dir));
