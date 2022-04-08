import { rx, t, R } from '../../common';

type O = Record<string, unknown>;

/**
 * [Helpers]
 */
export const Util = {
  renderNull() {
    return null;
  },

  /**
   * Genrate a new "default state" object.
   */
  defaultState(partial?: t.PartialDeep<t.CmdCardState>): t.CmdCardState {
    const render = Util.renderNull;
    const state: t.CmdCardState = {
      commandbar: {},
      backdrop: {
        render,
        state: {},
      },
      body: {
        render,
        state: {},
        show: 'CommandBar',
      },
    };
    return partial ? R.mergeDeepRight(state, partial as any) : state;
  },

  instance: {
    /**
     * Compare instance details.
     */
    isChanged(prev: t.CmdCardInstance, next: t.CmdCardInstance) {
      return rx.bus.instance(prev.bus) !== rx.bus.instance(next.bus) || prev.id !== next.id;
    },
  },
};
