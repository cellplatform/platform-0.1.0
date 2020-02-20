import { bundle } from '@platform/cell.compile.web';
import { fs } from '@platform/fs';

import { constants } from '../app/src/main/common';

(async () => {
  // const f = require('@platform/cell.compile.web');

  const base = fs.resolve('.');
  const path = constants.paths.assets.ui.substring(base.length + 1);
  const targetDir = fs.join(base, 'app', path);

  await bundle({ moduleName: '@platform/cell.ui.sys', targetDir });
})();
