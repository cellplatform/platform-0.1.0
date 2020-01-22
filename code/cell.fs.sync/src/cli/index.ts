import { t } from './common';
import * as dir from './dir';
import * as dirSync from './dirSync';
import * as dirWatch from './dirWatch';
import * as dirPull from './dirPull';

/**
 * Initialize the command-line-interface (CLI).
 */
export const init: t.CmdPluginsInit = cli => {
  dir.init(cli);
  dirSync.init(cli);
  dirWatch.init(cli);
  dirPull.init(cli);
  return cli;
};
