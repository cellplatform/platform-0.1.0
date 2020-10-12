import { fs } from '@platform/fs';
import { t, log } from '../../common';

/**
 * Copies a module locally.
 */
export async function copyLocal(args: { sourceDir: string }) {
  const { sourceDir } = args;
  const pkgPath = fs.join(sourceDir, 'package.json');

  if (!(await fs.exists(pkgPath))) {
    log.error('Package.json file not found');
    log.info.gray(pkgPath);
    log.info();
    return { ok: false, files: [], sourceDir, targetDir: '' };
  }

  const pkg = await fs.file.loadAndParse<t.INpmPackageJson>(pkgPath);
  const targetDir = fs.resolve(`tmp/${pkg.name}`);
  await fs.ensureDir(targetDir);

  const copy = async (path: string) => {
    const from = fs.join(sourceDir, path);
    const to = fs.join(targetDir, path);
    if (await fs.exists(from)) {
      await fs.copy(from, to);
    }
  };

  const files = ['package.json', 'yarn.lock', 'src', 'sh', 'script.sh', 'script.ts'];
  await Promise.all(files.map(copy));

  return { ok: true, files, sourceDir, targetDir };
}
