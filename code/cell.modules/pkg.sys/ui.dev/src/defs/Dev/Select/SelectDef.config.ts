import React from 'react';

import { DEFAULT, format, SelectUtil, t } from '../../../common';

type O = Record<string, unknown>;

/**
 * A [Select] dropdown configurator.
 */

export function config<Ctx extends O>(ctx: Ctx, params: any[]) {
  const item = SelectUtil.default();

  const config: t.ActionSelectConfigArgs<any> = {
    ctx,
    initial(value) {
      let initial = Array.isArray(value) ? value : [value];
      initial = item.multi ? initial : initial.slice(0, 1); // NB: if not "multi" only take the first item.
      item.current = initial.map((value) => SelectUtil.toOption(value));
      return config;
    },
    title(value) {
      item.title = React.isValidElement(value) ? value : format.string(value, { trim: true });
      return config;
    },
    label(value) {
      item.label = React.isValidElement(value)
        ? value
        : format.string(value, { trim: true }) || DEFAULT.UNNAMED;
      return config;
    },
    description(value) {
      item.description = React.isValidElement(value) ? value : format.string(value, { trim: true });
      return config;
    },
    items(list) {
      if (Array.isArray(list)) item.items = list;
      return config;
    },
    multi(value) {
      item.multi = value;
      return config;
    },
    clearable(value) {
      item.clearable = value;
      return config;
    },
    view(value) {
      item.view = value;
      return config;
    },
    pipe(...handlers) {
      item.handlers.push(...handlers.filter(Boolean));
      return config;
    },
  };

  if (typeof params[0] === 'function') {
    params[0](config);
  }

  return { item, config };
}
