import { bundle } from '@platform/cell.compile.web';
import { fs } from '@platform/fs';
import { constants } from '../app/src/main/common';

async function run(sourceDir: string, targetDir: string) {
  const base = fs.resolve('.');
  targetDir = fs.join(base, 'app', targetDir.substring(base.length + 1));
  sourceDir = fs.resolve(sourceDir);
  await bundle({ sourceDir, targetDir });
}

(async () => {
  const target = constants.paths.bundle;
  await run('../cell.ui.sys', target.sys);
})();
