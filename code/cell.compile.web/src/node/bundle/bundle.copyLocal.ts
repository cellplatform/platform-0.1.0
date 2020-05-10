import { fs } from '@platform/fs';
import { t } from '../../common';

/**
 * Copies a module locally.
 */
export async function copyLocal(args: { sourceDir: string }) {
  const { sourceDir } = args;
  const pkg = await fs.file.loadAndParse<t.INpmPackageJson>(fs.join(sourceDir, 'package.json'));

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

  return { files, sourceDir, targetDir };
}
