import { t } from '../common';
import * as dir from './dir';
import * as syncDir from './syncDir';
import * as syncWatch from './syncWatch';

/**
 * Initialize the command-line-interface (CLI).
 */
export const init: t.CmdPluginsInit = cli => {
  dir.init(cli);
  syncDir.init(cli);
  syncWatch.init(cli);
  return cli;
};
