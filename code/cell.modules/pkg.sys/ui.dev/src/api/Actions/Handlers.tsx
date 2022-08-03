import { DEFAULT, t } from './common';
import { Context } from './Context';
import { renderList } from './render.List';
import { renderSubject } from './render.Subject';

/**
 * Action handlers.
 */
export const Handlers = {
  /**
   * Composes a set of actions together.
   */
  compose(defs: t.ActionDef[]) {
    // Ensure there are no configuration method-name conflicts.
    defs.forEach((def) => {
      const method = def.config.method;
      const matches = defs.filter((def) => def.config.method === method);
      if (matches.length > 1) {
        const err = `A definition with the configuration method '${method}' has been added more than once (kind: '${def.kind}')`;
        throw new Error(err);
      }
    });

    type M = t.ActionsModel<any>;
    type F = t.Actions<any>;
    const handlers: t.BuilderHandlers<M, F> = {
      /**
       * Retrieves the action/method definitions.
       */
      toDefs: () => defs,

      /**
       * Convert builder to data model.
       */
      toModel: (args) => args.model,

      /**
       * Convert builder to data model.
       */
      toObject: (args) => args.model.state,

      /**
       * Convert builder to an [StateObject] event source.
       */
      toEvents: (args) => args.model.event,

      /**
       * Derives the current context ("ctx") for the builder.
       */
      toContext: (args) => Context.getAndStore(args.model),

      /**
       * Create a clone of the builder (optionally changing the "context" factory).
       */
      clone(args) {
        const clone = args.clone();
        if (typeof args.params[0] === 'function') clone.context(args.params[0]);
        return clone;
      },

      /**
       * Render to an <ActionPanel>.
       */
      renderActionPanel(args) {
        const bus = args.params[0] as t.EventBus;
        const props = args.params[1] as t.ActionPanelProps;
        const actions = args.builder.self;
        return renderList({ bus, props, actions });
      },

      /**
       * Render the subject(s) under test.
       */
      renderSubject(args) {
        const model = args.model;
        return renderSubject({ model });
      },

      /**
       * Factory for the context (provided to each action).
       */
      context(args) {
        const fn = args.params[0];
        if (typeof fn !== 'function') throw new Error('Context factory function not provided');
        args.model.change((draft) => (draft.ctx.get = fn));
      },

      /**
       * Runs an "initialize" setup when the actions are shown.
       */
      init(args) {
        const fn = args.params[0];
        if (typeof fn !== 'function') throw new Error('Initializer function not provided');
        args.model.change((draft) => (draft.init = fn));
      },

      /**
       * Factory that renders the component under test.
       */
      subject(args) {
        const fn = args.params[0];
        if (typeof fn !== 'function') throw new Error('Subject factory function not provided');
        args.model.change((draft) => (draft.subject = fn));
      },

      /**
       * Merges in another Action model's items.
       */
      merge(args) {
        const mergeBuilder = args.params[0] as t.Actions;
        const options = (args.params[1] || {}) as t.ActionAddOptions;
        const insertAt = options.insertAt ?? 'end';

        args.model.change((draft) => {
          const obj = mergeBuilder.toObject();
          if (insertAt === 'start') {
            draft.items = [...obj.items, ...draft.items];
          }
          if (insertAt === 'end') {
            draft.items = [...draft.items, ...obj.items];
          }

          if (!draft.ctx.get && obj.ctx.get) {
            draft.ctx.get = obj.ctx.get;
          }
        });
      },

      /**
       * Name (of the set of actions)
       */
      namespace(args) {
        const namespace = (args.params[0] || '').trim() || DEFAULT.UNNAMED;
        args.model.change((draft) => (draft.namespace = namespace));
      },

      /**
       * A handler that exposes the API for configuring action items.
       */
      items(args) {
        const fn = args.params[0];
        if (typeof fn === 'function') {
          const actions = args.model;
          const ctx = args.builder.self.toContext();
          const payload = {} as any;

          defs.forEach((def) => {
            const { method, handler } = def.config;
            if (payload[method]) throw new Error(`Method '${method}' already exists`);

            payload[method] = (...params: any) => {
              handler({ ctx, actions, params });
              return payload;
            };
          });

          fn(payload);
        }
      },
    };

    // Finish up.
    return handlers;
  },
};
