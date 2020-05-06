import { bundle } from '@platform/cell.compile.web';
import { fs } from '@platform/fs';

import { constants } from '../app/src/main/common';

(async () => {
  const paths = constants.paths;
  const base = fs.resolve('.');
  const targetDir = fs.join(base, 'app', paths.bundle.sys.substring(base.length + 1));

  await bundle({ moduleName: '@platform/cell.ui.sys', targetDir });
})();
