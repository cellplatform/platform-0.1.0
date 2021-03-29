import React from 'react';
import { DEFAULT, format, slug, t } from '../common';

type O = Record<string, unknown>;

/**
 * A [Button] configurator.
 */
export function config<Ctx extends O>(ctx: Ctx, params: any[]) {
  const label = DEFAULT.UNNAMED;
  const item: t.ActionButton = { id: slug(), kind: 'dev/button', label, handlers: [] };

  const config: t.ActionButtonConfigArgs<any> = {
    ctx,
    title(value) {
      item.title = React.isValidElement(value) ? value : format.string(value, { trim: true });
      return config;
    },
    label(value) {
      item.label = React.isValidElement(value)
        ? value
        : format.string(value, { trim: true }) || label;
      return config;
    },
    description(value) {
      item.description = React.isValidElement(value) ? value : format.string(value, { trim: true });
      return config;
    },
    indent(value) {
      item.indent = format.number(value, { min: 0, default: 0 });
      return config;
    },

    pipe(...handlers) {
      item.handlers.push(...handlers.filter(Boolean));
      return config;
    },
  };

  if (typeof params[0] === 'function') {
    params[0](config);
  } else {
    config.label(params[0]).pipe(params[1]);
  }

  return { item, config };
}
