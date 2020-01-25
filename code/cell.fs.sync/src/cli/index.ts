import { t } from './common';
import * as dir from './cmd.dir';
import * as dirSync from './cmd.dirSync';
import * as dirWatch from './cmd.dirWatch';
import * as dirPull from './cmd.dirPull';

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
