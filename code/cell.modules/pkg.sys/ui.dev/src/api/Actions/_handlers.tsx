import { DEFAULT, defaultValue, t, R } from '../../common';
import { Context } from './Context';
import { renderList } from './render.List';
import { renderSubject } from './render.Subject';

type O = Record<string, unknown>;

/**
 * Action handlers.
 */
export const Handlers = {
  /**
   * Composes a set of actions together with its
   */
  compose(defs: t.ActionDef[]) {
    // Ensure there are not configuration name conflicts.
    defs.forEach((def) => {
      const method = def.config.method;
      const matches = defs.filter((def) => def.config.method === method);
      if (matches.length > 1) {
        const err = `A definition with the configuration method '${method}' has been added more than once (kind: '${def.kind}')`;
        throw new Error(err);
      }
    });

    const handlers: t.BuilderHandlers<t.ActionsModel<any>, t.Actions<any>, t.ActionsChangeType> = {
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
       * Factory that renders the component under test.
       */
      subject(args) {
        const fn = args.params[0];
        if (typeof fn !== 'function') throw new Error('Subject factory function not provided');
        args.model.change((draft) => (draft.renderSubject = fn));
      },

      /**
       * Merges in another Action model's items.
       */
      merge(args) {
        const mergeBuilder = args.params[0] as t.Actions;
        const options = (args.params[1] || {}) as t.ActionAddOptions;
        const insertAt = defaultValue(options.insertAt, 'end');

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
       * Button.
       */
      // button(args) {
      //   const ctx = args.builder.self.toContext();
      //   const { item } = Button.config(ctx, args.params);
      //   args.model.change((draft) => draft.items.push(item));
      // },

      /**
       * Boolean (Switch).
       */
      // boolean(args) {
      //   const ctx = args.builder.self.toContext();
      //   const { item } = Bool.config(ctx, args.params);
      //   args.model.change((draft) => draft.items.push(item));
      // },

      /**
       * Boolean (Switch).
       */
      // select(args) {
      //   const ctx = args.builder.self.toContext();
      //   const { item } = Select.config(ctx, args.params);
      //   args.model.change((draft) => draft.items.push(item));
      // },

      /**
       * Horizontal rule.
       */
      // hr(args) {
      //   const ctx = args.builder.self.toContext();
      //   const { item } = Hr.config(ctx, args.params);
      //   args.model.change((draft) => draft.items.push(item));
      // },

      /**
       * Title block.
       */
      // title(args) {
      //   const ctx = args.builder.self.toContext();
      //   const { item } = Title.config(ctx, args.params);
      //   args.model.change((draft) => draft.items.push(item));
      // },

      /**
       * A handler that exposes the API for configuring action items.
       */
      items(args) {
        const fn = args.params[0];
        if (typeof fn === 'function') {
          const payload = {} as any;
          const actions = args.model;
          const ctx = args.builder.self.toContext();

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
