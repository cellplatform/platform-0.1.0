import * as React from 'react';

import { defaultValue, t } from '../../common';
import { View as ActionPanel } from '../../components/ActionPanel/View';
import { ButtonConfig } from './config.Button';
import { GroupConfig } from './config.Group';
import { HrConfig } from './config.Hr';
import { TitleConfig } from './config.Title';
import { toContext } from './util';

/**
 * Action handlers.
 */

export const handlers: t.BuilderHandlers<t.ActionModel<any>, t.ActionModelMethods<any>> = {
  /**
   * Convert builder to data model.
   */
  toObject: (args) => args.model.state,

  /**
   * Derives the current context ("ctx") for the builder.
   */
  toContext(args) {
    return toContext(args.model);
  },

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
  render(args) {
    const props = args.params[0] || {};
    const getContext = () => args.builder.self.toContext();
    return <ActionPanel {...props} model={args.model.state} getContext={getContext} />;
  },

  /**
   * The factory for the context (provided to each action).
   */
  context(args) {
    const value = args.params[0];
    if (typeof value !== 'function') {
      throw new Error('Context factory function not provided');
    }
    args.model.change((draft) => (draft.getContext = value));
  },

  /**
   * Merges in another Action model's items.
   */
  merge(args) {
    const mergeBuilder = args.params[0] as t.ActionModelBuilder<any>;
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

      if (!draft.getContext && obj.getContext) {
        draft.getContext = obj.getContext;
      }
    });
  },

  /**
   * A group of items.
   */
  group(args) {
    const { item } = GroupConfig(args.params);
    args.model.change((draft) => draft.items.push(item));
  },

  /**
   * An action button.
   */
  button(args) {
    const { item } = ButtonConfig(args.params);
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
