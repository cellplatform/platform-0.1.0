import * as React from 'react';

import { Builder, DEFAULT, t } from '../common';
import { View as ActionPanel } from '../components/ActionPanel/View';

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
    return <ActionPanel {...(args.params[0] || {})} actions={args.model.state} />;
  },

  name(args) {
    const value = format.string(args.params[0], { trim: true });
    args.model.change((draft) => (draft.name = value || DEFAULT.ACTIONS.name));
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
