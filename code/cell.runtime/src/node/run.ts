import { Bundle } from './Bundle';
import { fs, HttpClient, log, logger, Path, t } from './common';
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

    console.log('isPullRequired', isPullRequired);

    if (isPullRequired) {
      const { ok, errors } = await pull(input, { silent });
      if (!ok) {
        return { ok, errors };
      }
    }

    //

    return { ok: true, errors: [] };
  };
  return fn;
}
