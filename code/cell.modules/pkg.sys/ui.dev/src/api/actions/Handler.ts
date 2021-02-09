import { t } from '../../common';

type O = Record<string, unknown>;

export const Handler = {
  /**
   * Prepares methods and immutable proxies for a [DevAction] handler invokation.
   */
  action<C extends O>(args: { ctx: C; env: t.ActionsModelEnv }) {
    const { ctx, env } = args;
    const host = env.host || (env.host = {});
    const layout = env.layout || (env.layout = {});
    return { ctx, env, host, layout };
  },

  /**
   * Prepares a [settings()] function that is passed to handlers for
   * modifying the environment state in standard ways.
   */
  settings<T, A extends t.ActionHandlerSettingsArgs = t.ActionHandlerSettingsArgs>(
    args: { env: t.ActionsModelEnv; payload: T },
    onInvoke?: (settings: A) => void,
  ) {
    const { env } = args;
    const fn: t.ActionHandlerSettings<T> = (settings) => {
      const { layout, host } = settings || {};
      if (layout !== undefined) {
        env.layout = layout === null ? {} : { ...env.layout, ...layout };
      }
      if (host !== undefined) {
        env.host = host === null ? {} : { ...env.host, ...host };
      }
      if (typeof onInvoke === 'function') onInvoke(settings as A);
      return args.payload;
    };
    return fn;
  },
};
