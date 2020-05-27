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

async function bundleModules(modules: { sourceDir: string; targetDir: string }[]) {
  const logList = () => {
    modules.forEach(item => {
      const name = fs.basename(item.sourceDir);
      log.info.gray(`module: ${log.green(name)}`);
    });
    log.info();
  };

  logList();

  for (const item of modules) {
    const { sourceDir, targetDir } = item;
    await run(sourceDir, targetDir);
  }

  log.info(`✨Bundled`);
  logList();
}

(async () => {
  const target = constants.paths.bundle;

  await bundleModules([
    { sourceDir: '../cell.ui.sys', targetDir: target.sys },
    // { sourceDir: '../cell.ui.finder', targetDir: target.finder },
    // { sourceDir: '../cell.ui.ide', targetDir: target.ide },
  ]);
})();
