import { t } from '../../common';

type O = Record<string, unknown>;

export const Handler = {
  /**
   * Prepares methods and immutable proxies for a [DevAction] handler invokation.
   */
  action<C extends O>(args: { ctx: C; env: t.DevActionsModelEnv }) {
    const { ctx, env } = args;
    const host = env.host || (env.host = {});
    const layout = env.layout || (env.layout = {});
    return { ctx, env, host, layout };
  },

  settings<T>(args: { env: t.DevActionsModelEnv; payload: T }) {
    const { env } = args;
    const fn: t.DevActionHandlerSettings<T> = (settings) => {
      const { layout, host } = settings || {};
      if (layout !== undefined) {
        env.layout = layout === null ? {} : { ...env.layout, ...layout };
      }
      if (host !== undefined) {
        env.host = host === null ? {} : { ...env.host, ...host };
      }
      return args.payload;
    };
    return fn;
  },
};
