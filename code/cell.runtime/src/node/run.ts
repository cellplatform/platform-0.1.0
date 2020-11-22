import { Bundle } from './Bundle';
import { fs, HttpClient, log, logger, Path, t } from './common';

/**
 * Factory for the [run] method.
 */
export function runMethod(args: { cachedir: string }) {
  /**
   * Pull and run the given bundle.
   */
  const fn: t.RuntimeEnvNode['run'] = async (input, options = {}) => {
    const { silent } = options;
    const bundle = Bundle(input, args.cachedir);
  };
  return fn;
}
