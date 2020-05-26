import { log } from './common';
import { savePackage } from '../lib/ts/savePackage';
import { fs } from '@platform/fs';

/**
 * SCRIPT
 *
 *    Copy common fields from [package.json] as constants
 *    to a default target location as a [.ts] file.
 *
 */
(async () => {
  const source = fs.resolve('package.json');
  const target = fs.resolve('src/common/constants.pkg.ts');
  await savePackage({ fs, source, target });

  log.info.green('\nSaved [package.json] constants to:');
  log.info.gray(`  ${target}\n`);
})();
