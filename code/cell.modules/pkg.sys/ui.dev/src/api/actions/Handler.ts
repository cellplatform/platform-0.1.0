import { t } from '../../common';

type O = Record<string, unknown>;
type SettingsArgs = t.ActionHandlerSettingsArgs;

export const Handler = {
  params: {
    /**
     * Prepares methods and immutable proxies for a [DevAction] handler invokation.
     */
    action<C extends O>(draft: { ctx: C; env: t.ActionsModelEnv }) {
      const { ctx, env } = draft;
      const host = env.host || (env.host = {});
      const layout = env.layout || (env.layout = {});
      return { ctx, env, host, layout };
    },

    /**
     * Prepare variables for a handler payload.
     */
    payload<T extends t.ActionItem>(itemId: string, draft: t.ActionsModel<any>) {
      const ctx = draft.ctx.current;
      const env = draft.env.viaAction;
      const { host, layout } = Handler.params.action({ ctx, env });
      const item = draft.items.find((item) => item.id === itemId) as T;
      return { ctx, host, item, layout, env };
    },
  },

  /**
   * Prepares a [settings()] function that is passed to handlers for
   * modifying the environment state in standard ways.
   */
  setting___OLD<T, A extends t.ActionHandlerSettingsArgs = t.ActionHandlerSettingsArgs>(
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

  settings: {
    handler<T, A extends SettingsArgs = SettingsArgs>(args: {
      env: t.ActionsModelEnv;
      payload: T;
      syncSource: (args: A) => O | undefined;
      syncTarget: t.ActionItem;
    }) {
      const { env, payload } = args;
      const fn: t.ActionHandlerSettings<T> = (settings) => {
        const { layout, host } = settings || {};
        if (layout !== undefined) {
          env.layout = layout === null ? {} : { ...env.layout, ...layout };
        }
        if (host !== undefined) {
          env.host = host === null ? {} : { ...env.host, ...host };
        }

        // Sync the source with the changes.
        const source = args.syncSource(settings as A);
        if (source) {
          Object.keys(source).forEach((key) => (args.syncTarget[key] = source[key]));
        }

        return payload;
      };
      return fn;
    },
  },
};
