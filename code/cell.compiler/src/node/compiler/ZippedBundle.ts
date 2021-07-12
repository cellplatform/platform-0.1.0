import { fs, ModelPaths, t } from '../common';
import { Manifest } from '../manifest';

/**
 * Manages producing a zipped bundle.
 */
export function ZippedBundle(model: t.CompilerModel) {
  const paths = ModelPaths(model);

  const api = {
    paths,
    async save() {
      const dir = fs.resolve(paths.out.bundle);
      const dirDist = fs.join(dir, 'dist');
      const dirDistZip = `${dirDist}.zip`;

      // Prepare bundle folder.
      await fs.remove(dir);
      await fs.ensureDir(dir);
      await fs.copy(
        fs.resolve(fs.join(paths.out.dist, 'index.json')),
        fs.join(dir, 'dist.zip.json'),
      );
      await fs.copy(paths.out.dist, dirDist);

      // Create zip archive.
      await fs.zip(dirDist).save(dirDistZip);
      await fs.remove(dirDist);

      // Finish up.
      await Manifest.createAndSave({ dir });
      return { dir };
    },
  };

  return api;
}
