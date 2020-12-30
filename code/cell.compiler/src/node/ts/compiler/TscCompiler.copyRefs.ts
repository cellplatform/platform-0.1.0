import { fs, R, t } from '../../common';
import { TypeManifest } from '../../manifest';
import { toDir, toResponseDir, toRelativePath } from '../util';

/**
 * Copies references within the given manifest (import/exports)
 * into folder adjacent to the given manifest.
 */

export const copyRefs: t.TscCopyBundleRefs = async (args) => {
  //
  const dir = toDir(args.dir);

  if (!(await fs.pathExists(dir.join()))) {
    throw new Error(`Source folder to copy from not found at: ${dir.join()}`);
  }

  const manifestPath = fs.join(dir.join(), TypeManifest.filename);
  if (!(await fs.pathExists(manifestPath))) {
    const err = `Source folder to copy-refs within does not contain an [index.json] manifest: ${manifestPath}`;
    throw new Error(err);
  }

  let manifest = (await TypeManifest.read({ dir: dir.join() })).manifest as t.TypelibManifest;
  if (!manifest || manifest.kind !== 'typelib' || !manifest.files) {
    const err = `Source folder to copy-refs within does not contain a valid "typelib" manifest: ${manifestPath}`;
    throw new Error(err);
  }

  return {
    dir: toResponseDir(dir),
  }; // TEMP 🐷
};

// export async function copyRefs(args: t.TscCopyBundleArgsRefs) {
// }
