import { fs, R, t } from '../../common';
import { TypeManifest } from '../../Manifest';
import { toDir, toRelativePath, toResponseDir } from '../util';

/**
 * Copy a compiled bundle.
 */
export const copyBundle: t.TscCopyBundle = async (args) => {
  const from = toDir(args.from);
  const to = toDir(args.to);

  if (!(await fs.pathExists(from.join()))) {
    throw new Error(`Source folder to copy from not found at: ${from.join()}`);
  }

  const manifestPath = fs.join(from.join(), TypeManifest.filename);
  if (!(await fs.pathExists(manifestPath))) {
    const err = `Source folder to copy from does not contain an [index.json] manifest: ${manifestPath}`;
    throw new Error(err);
  }

  let manifest = (await TypeManifest.read({ dir: from.join() })).manifest as t.TypelibManifest;
  if (!manifest || manifest.kind !== 'typelib' || !manifest.files) {
    const err = `Source folder to copy from does not contain a valid "typelib" manifest: ${manifestPath}`;
    throw new Error(err);
  }

  // Prepare copy paths.
  await fs.ensureDir(to.join());
  const paths = {
    source: await fs.glob.find(`${from.join()}/**/*`),
    target: [] as string[],
  };

  if (typeof args.filter === 'function') {
    paths.source = paths.source.filter((path) => {
      if (path === manifestPath) return true;
      return args.filter ? args.filter(path) : true;
    });
  }

  const transformations: t.TscPathTransform[] = [];
  const transformTargetPath = (from: string) => {
    if (typeof args.transformPath !== 'function') return from;
    const to = args.transformPath(from);
    if (typeof to === 'string' && to !== from) {
      transformations.push({ from, to });
      return to;
    } else {
      return from;
    }
  };

  // Perform copy operation.
  await Promise.all(
    paths.source.map(async (path) => {
      const relative = transformTargetPath(toRelativePath(from, path));
      const target = fs.join(to.join(), relative);
      paths.target.push(target);
      await fs.copy(path, target);
    }),
  );

  // Adjust manifest.
  if (transformations.length > 0) {
    manifest = R.clone(manifest);
    transformations.forEach((change) => {
      const file = manifest.files.find((file) => file.path === change.from);
      if (file) file.path = change.to;
    });
    await TypeManifest.write({ dir: to.base, manifest });
  }

  return {
    from: toResponseDir(from),
    to: toResponseDir(to),
    paths: paths.target,
    transformations,
    manifest,
  };
};
