import { Bundle } from './Bundle';
import { fs, HttpClient, log, logger, Path, t, PATH } from './common';
import { pullMethod } from './pull';

/**
 * Factory for the [run] method.
 */
export function runMethod(args: { cachedir: string }) {
  const { cachedir } = args;
  const pull = pullMethod({ cachedir });

  /**
   * Pull and run the given bundle.
   */
  const fn: t.RuntimeEnvNode['run'] = async (input, options = {}) => {
    const { silent } = options;
    const bundle = Bundle(input, cachedir);
    const exists = await bundle.exists();
    const isPullRequired = !exists || options.pull;

    const errors: Error[] = [];

    const done = () => {
      const ok = errors.length === 0;
      return { ok, errors };
    };

    // Ensure the bundle has been pulled locally.
    if (isPullRequired) {
      const { ok, errors } = await pull(input, { silent });
      errors.push(...errors);
      if (!ok || errors.length > 0) {
        return done();
      }
    }

    const loadManifest = async () => {
      const path = fs.join(bundle.cache.dir, PATH.MANIFEST_FILENAME);
      const exists = await fs.pathExists(path);
      if (!exists) {
        const error = new Error(`A bundle manifest file does not exist ${bundle.toString()}.`);
        errors.push(error);
        return undefined;
      } else {
        try {
          const manifest = (await fs.readJson(path)) as t.BundleManifest;
          return manifest;
        } catch (error) {
          const msg = error.message;
          const err = `Failed while reading bundle manifest for ${bundle.toString()}. ${msg}`;
          errors.push(new Error(err));
          return undefined;
        }
      }
    };

    const manifest = await loadManifest();
    if (!manifest) {
      return done();
    }

    console.log('manifest', manifest);

    //

    return done();
  };
  return fn;
}
