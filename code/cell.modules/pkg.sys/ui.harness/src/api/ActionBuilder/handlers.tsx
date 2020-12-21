import * as React from 'react';

import { Builder, t, defaultValue } from '../../common';
import { View as ActionPanel } from '../../components/ActionPanel/View';

const format = Builder.format;

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
    if (typeof args.params[0] === 'function') {
      clone.context(args.params[0]);
    }
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
};

/**
 * [Helpers]
 */

function GroupConfig(params: any[]) {
  const item: t.ActionItemGroup = { type: 'group', name: 'Unnamed', items: [] };

  const config: t.ActionGroupConfigArgs<any> = {
    name(value) {
      item.name = format.string(value, { trim: true }) || 'Unnamed';
      return config;
    },

    button(...params: any[]) {
      item.items.push(ButtonConfig(params).item);
      return config as any;
    },

    hr(...params: any[]) {
      item.items.push(HrConfig(params).item);
      return config as any;
    },
  };

  if (typeof params[0] === 'function') {
    params[0](config);
  } else {
    if (typeof params[0] === 'string') {
      config.name(params[0]);
    }
    if (typeof params[1] === 'function') {
      params[1](config);
    }
  }

  return { item, config };
}

/**
 * [Helpers]
 */

function ButtonConfig(params: any[]) {
  const LABEL = 'Unnamed';
  const item: t.ActionItemButton = { type: 'button', label: LABEL };

  const config: t.ActionButtonConfigArgs<any> = {
    label(value) {
      item.label = format.string(value, { trim: true }) || LABEL;
      return config;
    },
    description(value) {
      item.description = format.string(value, { trim: true });
      return config;
    },
    onClick(handler) {
      item.onClick = handler;
      return config;
    },
  };

  if (typeof params[0] === 'function') {
    params[0](config);
  } else {
    config.label(params[0]).onClick(params[1]);
  }

  return { item, config };
}

function HrConfig(params: any[]) {
  const item: t.ActionItemHr = { type: 'hr' };
  return { item };
}

function toContext<Ctx>(model: t.ActionModelState<Ctx>): Ctx | null {
  const state = model.state;
  if (state.getContext) {
    const ctx = state.getContext(state.ctx || null);
    model.change((draft) => (draft.ctx = ctx));
    return ctx;
  } else {
    return null;
  }
}
