import * as React from 'react';

import { defaultValue, t } from '../../common';
import { View as ActionPanel } from '../../components/ActionPanel/View';
import { ButtonConfig } from './config.Button';
import { HrConfig } from './config.Hr';
import { TitleConfig } from './config.Title';
import { toContext } from './context';

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
  toContext: (args) => toContext(args.model),

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
    const props = args.params[0] || {};
    const getContext = () => args.builder.self.toContext();
    return <ActionPanel {...props} model={args.model.state} getContext={getContext} />;
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
