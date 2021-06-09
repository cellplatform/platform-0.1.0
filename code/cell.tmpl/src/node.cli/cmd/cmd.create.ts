import { t } from '../common';
import { tmpl } from '../../tmpl';

/**
 * Create a template in the current directory.
 */
export async function create(argv: t.Argv) {
  const install = Boolean(argv.install);
  const dir = process.cwd();
  await tmpl({ dir, install });
}
