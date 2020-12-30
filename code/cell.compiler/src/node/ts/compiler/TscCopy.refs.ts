import { fs, R, t } from '../../common';
import { TypeManifest } from '../../manifest';
import { toDir, toResponseDir, toRelativePath } from './util';

/**
 * Copies references within the given manifest (import/exports)
 * into folder adjacent to the given manifest.
 */
export const refs: t.TscCopyRefs = async (args) => {
  const sourceDir = toDir(args.sourceDir);
  const targetDir = args.targetDir || sourceDir.base;

  if (!(await fs.pathExists(sourceDir.join()))) {
    throw new Error(`Source folder to copy from not found at: ${sourceDir.join()}`);
  }

  const manifestPath = fs.join(sourceDir.join(), TypeManifest.filename);
  if (!(await fs.pathExists(manifestPath))) {
    const err = `Source folder to copy-refs within does not contain an [index.json] manifest: ${manifestPath}`;
    throw new Error(err);
  }

  let manifest = (await TypeManifest.read({ dir: sourceDir.join() })).manifest as t.TypelibManifest;
  if (!manifest || manifest.kind !== 'typelib' || !manifest.files) {
    const err = `Source folder to copy-refs within does not contain a valid "typelib" manifest: ${manifestPath}`;
    throw new Error(err);
  }

  return {
    dir: toResponseDir(sourceDir),
  };
};
