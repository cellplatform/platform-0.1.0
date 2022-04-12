import { rx, t, R } from '../../common';

type O = Record<string, unknown>;

/**
 * [Helpers]
 */
export const Util = {
  /**
   * Generate a new "default state" object.
   */
  defaultState<A extends O = any, B extends O = any>(
    partial?: t.PartialDeep<t.CmdCardState<A, B>>,
  ): t.CmdCardState<A, B> {
    const base: t.CmdCardState<A, B> = {
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

  wrangleStateInput(input?: t.CmdCardState | (() => t.CmdCardState)) {
    return typeof input === 'function' ? input() : input;
  },

  /**
   * Render nothing.
   */
  renderNull(): JSX.Element | null {
    return null;
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
