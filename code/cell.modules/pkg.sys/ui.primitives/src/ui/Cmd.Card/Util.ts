import { t } from './common';

export const Util = {
  /**
   * Genrate a new "default state" object.
   */
  defaultState(): t.CmdCardState {
    return {
      commandbar: {},
      backdrop: {},
      body: { show: 'CommandBar' },
    };
  },
};
