import { fs } from '@platform/fs';

/**
 * Remove generated files.
 */
const dirs = ['.cache', '.dev', '.uiharness', 'lib', 'test/now/tmp'];
dirs.forEach(dir => fs.removeSync(dir));
