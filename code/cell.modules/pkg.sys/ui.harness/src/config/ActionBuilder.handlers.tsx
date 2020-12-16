import * as React from 'react';

import { Builder, DEFAULT, t } from '../common';
import { View as ActionPanel } from '../components/ActionPanel/View';

const format = Builder.format;

/**
 * Action handlers.
 */

export const handlers: t.BuilderHandlers<t.ActionModel<any>, t.ActionModelMethods<any>> = {
  toObject: (args) => args.model.state,

  clone(args) {
    const clone = args.clone();
    if (typeof args.params[0] === 'function') {
      clone.context(args.params[0]);
    }
    return clone;
  },

  render(args) {
    return <ActionPanel {...(args.params[0] || {})} actions={args.model.state} />;
  },

  name(args) {
    const value = format.string(args.params[0], { trim: true });
    args.model.change((draft) => (draft.name = value || DEFAULT.ACTIONS.name));
  },

  context(args) {
    const value = args.params[0];
    if (typeof value !== 'function') {
      throw new Error('Context factory function not provided');
    }
    args.model.change((draft) => (draft.getContext = value));
  },

  button(args) {
    const item: t.ActionItemButton = { type: 'button', label: '', onClick: () => null };

    const config: t.ActionButtonConfigArgs<any> = {
      label(value) {
        item.label = format.string(value, { trim: true }) || 'Untitled';
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

    if (typeof args.params[0] === 'function') {
      args.params[0](config);
    } else {
      config.label(args.params[0]).onClick(args.params[1]);
    }

    args.model.change((draft) => draft.items.push(item));
  },
};
