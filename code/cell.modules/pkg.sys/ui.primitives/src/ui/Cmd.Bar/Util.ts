import { t } from './common';

export const Util = {
  /**
   * Genrate a new "default state" object.
   */
  defaultState(): t.CmdBarState {
    return {};
  },

  /**
   * Determine if the state has changed (requires redraw).
   */
  stateChanged(prev: t.CmdBarState, next: t.CmdBarState) {
    if (prev.history?.total !== next.history?.total) return true;
    if (prev.text !== next.text) return true;
    if (prev.spinning !== next.spinning) return true;
    return false;
  },
};
