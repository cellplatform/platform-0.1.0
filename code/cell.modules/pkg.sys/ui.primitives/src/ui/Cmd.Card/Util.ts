import { rx, t, R } from '../../common';

/**
 * [Helpers]
 */
export const Util = {
  /**
   * Render nothing.
   */
  renderNull(): JSX.Element | null {
    return null;
  },

  /**
   * State helpers.
   */
  state: {
    /**
     * Generate a new "default state" object.
     */
    default(partial?: t.PartialDeep<t.CmdCardState>): t.CmdCardState {
      const base: t.CmdCardState = {
        ready: false,
        body: {
          render: Util.renderNull,
          state: {} as any,
          show: 'CommandBar',
        },
        backdrop: {
          render: Util.renderNull,
          state: {} as any,
        },
        commandbar: {
          text: '',
          textbox: { pending: false, spinning: false, placeholder: 'command' },
        },
      };
      return partial ? R.mergeDeepRight(base, partial as any) : base;
    },
  },

  /**
   * Component instance helpers.
   */
  instance: {
    /**
     * Compare instance details.
     */
    isChanged(prev: t.CmdCardInstance, next: t.CmdCardInstance) {
      return rx.bus.instance(prev.bus) !== rx.bus.instance(next.bus) || prev.id !== next.id;
    },
  },
};
