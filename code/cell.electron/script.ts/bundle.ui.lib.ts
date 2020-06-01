import { bundle } from '@platform/cell.compile.web';
import { fs } from '@platform/fs';
import { log } from '@platform/log/lib/server';

export async function run(sourceDir: string, targetDir: string, silent?: boolean) {
  const base = fs.resolve('.');
  targetDir = fs.join(base, 'app', targetDir.substring(base.length + 1));
  sourceDir = fs.resolve(sourceDir);
  const res = await bundle({ sourceDir, targetDir });
  if (!silent) {
    log.info.gray('━'.repeat(60));
  }
  return res;
}

export async function bundleModules(
  modules: { sourceDir: string; targetDir: string }[],
  options: { silent?: boolean } = {},
) {
  const items = modules.map((item) => ({ ...item, bytes: 0, files: [] }));

  const logList = (includeSize: boolean) => {
    if (options.silent) {
      return;
    }
    items.forEach((item) => {
      const name = fs.basename(item.sourceDir);
      const files = `${item.files.length} files`;
      const bytes = item.bytes;
      const filesize = fs.size.toString(bytes);
      const size = bytes === 0 ? log.red(filesize) : log.blue(filesize);
      const suffix = !includeSize ? '' : `- ${files} (${size})`;
      log.info.gray(`module: ${log.green(name)} ${suffix}`);
    });
    log.info();
  };

  logList(false);

  for (const item of items) {
    const { sourceDir, targetDir } = item;
    const { bytes, files } = await run(sourceDir, targetDir);
    item.bytes = bytes;
    item.files = files;
  }

  log.info(`✨Bundled`);
  logList(true);
}
