import { DEFAULT, defaultValue, t } from '../../common';
import { BooleanConfig } from './config.Boolean';
import { ButtonConfig } from './config.Button';
import { HrConfig } from './config.Hr';
import { TitleConfig } from './config.Title';
import { getAndStoreContext } from './context';
import { renderList, renderSubject } from './render';

type O = Record<string, unknown>;

/**
 * Action handlers.
 */
export const handlers: t.BuilderHandlers<
  t.DevActionsModel<any>,
  t.DevActionsModelMethods<any>,
  t.DevActionsChangeType
> = {
  /**
   * Convert builder to data model.
   */
  toModel: (args) => args.model,

  /**
   * Convert builder to data model.
   */
  toObject: (args) => args.model.state,

  /**
   * Convert builder to event object.
   */
  toEvents: (args) => args.model.event,

  /**
   * Derives the current context ("ctx") for the builder.
   */
  toContext: (args) => getAndStoreContext(args.model),

  /**
   * Create a clone of the builder (optionally changing the context factory.)
   */
  clone(args) {
    const clone = args.clone();
    if (typeof args.params[0] === 'function') clone.context(args.params[0]);
    return clone;
  },

  /**
   * Render to an <ActionPanel>.
   */
  renderList(args) {
    const bus = args.params[0] as t.EventBus;
    const props = args.params[1] as t.ActionPanelProps;
    const actions = args.builder.self;
    return renderList({ bus, props, actions });
  },

  /**
   * Render the subject(s) under test.
   */
  renderSubject(args) {
    const ctx = args.builder.self.toContext();
    const model = args.model.state;
    return renderSubject<O>({ ctx, model });
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
    const mergeBuilder = args.params[0] as t.DevActions<any>;
    const options = (args.params[1] || {}) as t.DevActionAddOptions;
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
  name(args) {
    const name = (args.params[0] || '').trim() || DEFAULT.UNNAMED;
    args.model.change((draft) => (draft.name = name));
  },

  /**
   * Button.
   */
  button(args) {
    const { item } = ButtonConfig(args.params);
    args.model.change((draft) => draft.items.push(item));
  },

  /**
   * Boolean (Switch).
   */
  boolean(args) {
    const { item } = BooleanConfig(args.params);
    args.model.change((draft) => draft.items.push(item));
  },

  /**
   * Horizontal rule.
   */
  hr(args) {
    const { item } = HrConfig(args.params);
    args.model.change((draft) => draft.items.push(item));
  },

  /**
   * Title block.
   */
  title(args) {
    const { item } = TitleConfig(args.params);
    args.model.change((draft) => draft.items.push(item));
  },
};
