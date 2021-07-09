import * as t from './types';
import { ModelPaths } from './util.model';
import { fs } from './libs';

/**
 * Manages producing a zipped bundle.
 */
export function ZippedBundle(model: t.CompilerModel) {
  const paths = ModelPaths(model);

  const api = {
    paths,
    async save() {
      const bundleDir = paths.out.bundle;
      const bundleDirDist = fs.join(bundleDir, 'dist');
      const path = `${bundleDirDist}.zip`;

      await fs.ensureDir(bundleDir);
      await fs.copy(fs.join(paths.out.dist, 'index.json'), fs.join(bundleDir, 'dist.json'));
      await fs.copy(paths.out.dist, bundleDirDist);
      await fs.zip(bundleDirDist).save(path);
      await fs.remove(bundleDirDist);

      return { path };
    },
  };

  return api;
}
