import { t } from '../common';

/**
 * Initialize Template command-line-interface (CLI).
 */
export const init: t.CmdPluginsInit = cli => {
  console.log('\n\ninit TMPL\n\n');
  // dir.init(cli);
  return cli;
};
