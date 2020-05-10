import { bundle } from '@platform/cell.compile.web';
import { fs } from '@platform/fs';
import { log } from '@platform/log/lib/server';
import { constants } from '../app/src/main/common';

async function run(sourceDir: string, targetDir: string) {
  const base = fs.resolve('.');
  targetDir = fs.join(base, 'app', targetDir.substring(base.length + 1));
  sourceDir = fs.resolve(sourceDir);
  await bundle({ sourceDir, targetDir });
  log.info.gray('━'.repeat(60));
}

(async () => {
  const target = constants.paths.bundle;
  await run('../cell.ui.sys', target.sys);
  await run('../cell.ui.finder', target.finder);
  await run('../cell.ui.ide', target.ide);
})();
