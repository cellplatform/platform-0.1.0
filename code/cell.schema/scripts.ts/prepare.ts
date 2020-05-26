import { savePackage } from '@platform/npm/lib/ts/savePackage';
import { fs } from '@platform/fs';

/**
 * SCRIPT
 *    Prepare package prior to publish.
 */
(async () => {
  await savePackage({ fs, target: 'src/common/constants.pkg.ts' });
})();
