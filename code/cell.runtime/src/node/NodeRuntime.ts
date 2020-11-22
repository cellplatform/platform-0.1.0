import { Bundle } from './Bundle';
import { fs, PATH, t } from './common';
import { puller } from './NodeRuntime.pull';

export const NodeRuntime = {
  /**
   * Initialize an instance of the Node runtime.
   */
  init(args: { cachedir?: string } = {}) {
    const cachedir = args.cachedir || PATH.CACHE_DIR;
    const pull = puller({ cachedir });

    const runtime: t.RuntimeEnvNode = {
      name: 'node',

      /**
       * Determine if the given bundle has been pulled.
       */
      async exists(input) {
        const bundle = Bundle(input, cachedir);
        return bundle.cache.exists(PATH.MANIFEST_FILENAME);
      },

      /**
       * Pull the given bundle.
       */
      pull,

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
       * Remove all bundles
       */
      async clear() {
        await fs.remove(cachedir);
      },

      /**
       * Pull and run the given bundle.
       */
      async run(input, options = {}) {
        const { silent } = options;
        const bundle = Bundle(input, cachedir);
        // TODO 🐷
        // return false;
      },
    };

    return runtime;
  },
};
