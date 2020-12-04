import { BundleWrapper } from '../BundleWrapper';
import { fs, PATH, t } from '../common';
import { pullMethod } from './pull';
import { runMethod } from './run';

export const NodeRuntime = {
  /**
   * Generates URLs for the given bundle.
   */
  urls(bundle: t.RuntimeBundleOrigin) {
    return BundleWrapper.urls(bundle);
  },

  /**
   * Initialize an instance of the Node runtime.
   */
  create(args: { cachedir?: string } = {}) {
    const cachedir = args.cachedir || PATH.CACHE_DIR;

    const runtime: t.RuntimeEnvNode = {
      name: 'node',
      version: (process.version || '').replace(/^v/, ''),
      pull: pullMethod({ cachedir }),
      run: runMethod({ cachedir }),

      /**
       * Determine if the given bundle has been pulled.
       */
      async exists(input) {
        return BundleWrapper.create(input, cachedir).isCached();
      },

      /**
       * Delete the given bundle (if it exists).
       */
      async remove(input) {
        const bundle = BundleWrapper.create(input, cachedir);
        const dir = bundle.cache.dir;
        let count = 0;
        if (await fs.pathExists(dir)) {
          count++;
          await fs.remove(dir);
        }
        return { count };
      },

      /**
       * Remove all bundles.
       */
      async clear() {
        const pattern = fs.join(cachedir, '*/*/*');
        const pulled = await fs.glob.find(pattern, { includeDirs: true });
        const count = pulled.length;
        await fs.remove(cachedir);
        return { count };
      },
    };

    return runtime;
  },
};
