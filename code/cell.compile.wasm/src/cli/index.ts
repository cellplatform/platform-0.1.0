import { t } from './common';
import * as compile from './cmd.compile';

/**
 * Initialize the command-line-interface (CLI).
 */
export const init: t.CmdPluginsInit = cli => {
  compile.init(cli);
  return cli;
};
