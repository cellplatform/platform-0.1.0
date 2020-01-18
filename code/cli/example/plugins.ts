import { t } from './libs';

// NB: Typically these would be imported from an external modules (aka "plugins").
import * as sample from './plugin.sample';
import * as keyboard from './plugin.keyboard';

/**
 * Initialize a plugin command to the application.
 * NB:
 *      This is useful when wanting to distribute various
 *      command implementations across multiple modules.
 */
export const init: t.CmdPluginsInit = cli => {
  sample.init(cli);
  keyboard.init(cli);
};
