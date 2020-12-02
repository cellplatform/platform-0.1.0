import { Bundle } from '../Bundle';
import { fs, log, logger, PATH, t } from '../common';
import { pullMethod } from './pull';
import { invoke } from './run.invoke';

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
    const bundle = Bundle.create(input, cachedir);
    const exists = await bundle.exists();
    const isPullRequired = !exists || options.pull;

    const errors: t.IRuntimeError[] = [];
    const addError = (message: string) =>
      errors.push({
        type: 'RUNTIME/run',
        bundle: bundle.toObject(),
        message,
      });

    const done = () => {
      const ok = errors.length === 0;
      return { ok, errors, manifest };
    };

    // Ensure the bundle has been pulled locally.
    if (isPullRequired) {
      const res = await pull(input, { silent });
      errors.push(...res.errors);
      if (!res.ok || errors.length > 0) {
        return done();
      }
    }

    const loadManifest = async () => {
      const path = fs.join(bundle.cache.dir, PATH.MANIFEST);
      const exists = await fs.pathExists(path);
      if (!exists) {
        const err = `A bundle manifest file does not exist ${bundle.toString()}.`;
        addError(err);
        return undefined;
      } else {
        try {
          const manifest = (await fs.readJson(path)) as t.BundleManifest;
          return manifest;
        } catch (error) {
          const msg = error.message;
          const err = `Failed while reading bundle manifest for ${bundle.toString()}. ${msg}`;
          addError(err);
          return undefined;
        }
      }
    };

    const manifest = await loadManifest();
    if (!manifest) {
      return done();
    }

    if (!silent) {
      const size = fs.size.toString(manifest.bytes, { round: 0 });
      const table = log.table({ border: false });
      const add = (key: string, value: string) => {
        table.add([log.green(key), log.gray(value)]);
      };

      add('runtime  ', 'node');
      add('target', `${manifest.target} (${manifest.mode})`);
      add('manifest ', logger.format.url(bundle.urls.manifest));
      add('files ', logger.format.url(bundle.urls.files));
      add('entry', manifest.entry);
      add('size', `${log.yellow(size)} (${manifest.files.length} files)`);

      log.info();
      table.log();
      logger.hr().newline();
    }

    //
    const cwd = bundle.cache.dir;
    const res = await invoke({ manifest, cwd, silent });

    /**
     * TODO 🐷
     * - use node.vm (V8)
     */

    return done();
  };
  return fn;
}
