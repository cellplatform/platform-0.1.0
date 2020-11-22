import { Bundle } from './Bundle';
import { fs, PATH, t } from './common';
import { pullMethod } from './pull';
import { runMethod } from './run';

export const NodeRuntime = {
  /**
   * Initialize an instance of the Node runtime.
   */
  init(args: { cachedir?: string } = {}) {
    const cachedir = args.cachedir || PATH.CACHE_DIR;

    const runtime: t.RuntimeEnvNode = {
      name: 'node',
      pull: pullMethod({ cachedir }),
      run: runMethod({ cachedir }),

      /**
       * Determine if the given bundle has been pulled.
       */
      async exists(input) {
        const bundle = Bundle(input, cachedir);
        return bundle.cache.exists(PATH.MANIFEST_FILENAME);
      },

      /**
       * Delete the given bundle (if it exists).
       */
      async remove(input) {
        const bundle = Bundle(input, cachedir);
        const dir = bundle.cache.dir;
        if (await fs.pathExists(dir)) {
          await fs.remove(dir);
        }
      },

      /**
       * Remove all bundles.
       */
      async clear() {
        await fs.remove(cachedir);
      },
    };

    return runtime;
  },
};
