import { fs } from '@platform/fs';

/**
 * Remove generated files.
 */
const dirs = ['.cache', '.dev', '.uiharness', 'lib', 'lib.test', 'test/now/tmp'];
dirs.forEach(dir => fs.removeSync(dir));
