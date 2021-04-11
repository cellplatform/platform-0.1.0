import { t, R } from '../../common';

type O = Record<string, unknown>;
type SettingsArgs = t.ActionHandlerSettingsArgs;

export const Handler = {
  /**
   * Retrieves a specific item from a set of actions.
   */
  findItem<T extends t.ActionItem>(itemId: string, actions: t.ActionsModel<any>) {
    return actions.items.find((item) => item.id === itemId) as T;
  },

  params: {
    /**
     * Prepares methods and immutable proxies for a [DevAction] handler invokation.
     */
    action<C extends O>(draft: { ctx: C; env: t.ActionsModelEnvProps }) {
      const { ctx, env } = draft;
      const host = env.host || (env.host = {});
      const layout = env.layout || (env.layout = {});
      const actions = env.actions || (env.actions = {});
      return { ctx, env, host, layout, actions };
    },

    /**
     * Prepare variables for a handler payload.
     */
    payload<T extends t.ActionItem>(itemId: string, draft: t.ActionsModel<any>) {
      const ctx = draft.ctx.current;
      const env = draft.env.viaAction;
      const { host, layout, actions } = Handler.params.action({ ctx, env });
      const item = Handler.findItem<T>(itemId, draft);
      return { ctx, item, host, layout, actions, env };
    },
  },

  settings: {
    /**
     * Prepares a [settings()] function that is passed to handlers for
     * modifying the environment state in standard ways.
     */
    handler<T, A extends SettingsArgs = SettingsArgs>(args: {
      env: t.ActionsModelEnvProps;
      payload: T;
      sync?: {
        source: (args: A) => O | undefined;
        target: t.ActionItem;
      };
    }) {
      const { env, payload } = args;
      const fn: t.ActionHandlerSettings<T> = (settings) => {
        const { layout, host, actions } = settings || {};

        if (layout !== undefined) {
          const next = layout === null ? {} : { ...env.layout, ...layout };
          if (!R.equals(env.layout, next)) env.layout = next;
        }
        if (host !== undefined) {
          const next = host === null ? {} : { ...env.host, ...host };
          if (!R.equals(env.host, next)) env.host = next;
        }
        if (actions !== undefined) {
          const next = actions === null ? {} : { ...env.actions, ...actions };
          if (!R.equals(env.actions, next)) env.actions = next;
        }

        // Sync the source with the changes.
        if (args.sync) {
          const source = args.sync.source(settings as A);
          const target = args.sync.target;
          if (source) {
            Object.keys(source).forEach((key) => (target[key] = source[key]));
          }
        }

        return payload;
      };
      return fn;
    },
  },
};
