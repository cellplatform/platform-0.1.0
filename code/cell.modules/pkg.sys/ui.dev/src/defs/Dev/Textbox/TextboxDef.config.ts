import React from 'react';

import { format, t, slug } from '../common';

type O = Record<string, unknown>;

/**
 * A [Boolean] switch configurator.
 */
export function config<Ctx extends O>(ctx: Ctx, params: any[]) {
  const item: t.ActionTextbox = { id: slug(), kind: 'dev/textbox', handlers: [] };

  const config: t.ActionTextboxConfigArgs<any> = {
    ctx,
    initial(value) {
      item.current = format.string(value, { trim: true });
      return config;
    },
    title(value) {
      item.title = React.isValidElement(value) ? value : format.string(value, { trim: true });
      return config;
    },
    placeholder(value) {
      item.placeholder = format.string(value, { trim: true });
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
    config.title(params[0]).pipe(params[1]);
  }

  return { item, config };
}
