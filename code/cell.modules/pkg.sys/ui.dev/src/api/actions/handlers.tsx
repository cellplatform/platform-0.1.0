import * as React from 'react';

import { DEFAULT, defaultValue, rx, t } from '../../common';
import { ActionPanel } from '../../components/ActionPanel';
import { ButtonConfig } from './config.Button';
import { BooleanConfig } from './config.Boolean';
import { HrConfig } from './config.Hr';
import { TitleConfig } from './config.Title';
import { getModelContext } from './context';
import { renderSubject } from './render';

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
  toModel: (args) => args.model.state,

  /**
   * Convert builder to event object.
   */
  toEvents: (args) => args.model.event,

  /**
   * Derives the current context ("ctx") for the builder.
   */
  toContext: (args) => getModelContext(args.model),

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
    const props = (args.params[1] || {}) as t.ActionPanelProps;
    if (!rx.isBus(bus)) throw new Error(`Event bus not provided`);
    return <ActionPanel {...props} bus={bus} model={args.model} />;
  },

  /**
   * Render the subject(s) under test.
   */
  renderSubject(args) {
    return renderSubject<any>({
      ctx: args.builder.self.toContext(),
      factory: args.model.state.renderSubject,
    });
  },

  /**
   * Factory for the context (provided to each action).
   */
  context(args) {
    const fn = args.params[0];
    if (typeof fn !== 'function') throw new Error('Context factory function not provided');
    args.model.change((draft) => (draft.getContext = fn));
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
    const mergeBuilder = args.params[0] as t.DevActionsModelBuilder<any>;
    const options = (args.params[1] || {}) as t.DevActionAddOptions;
    const insertAt = defaultValue(options.insertAt, 'end');

    args.model.change((draft) => {
      const obj = mergeBuilder.toModel();
      if (insertAt === 'start') {
        draft.items = [...obj.items, ...draft.items];
      }
      if (insertAt === 'end') {
        draft.items = [...draft.items, ...obj.items];
      }

      if (!draft.getContext && obj.getContext) {
        draft.getContext = obj.getContext;
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
