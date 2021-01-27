import { format, t, slug } from '../../common';

/**
 * A [Select] dropdown configurator.
 */
export function SelectConfig(params: any[]) {
  const LABEL = 'Unnamed';
  const item: t.DevActionSelect = {
    id: slug(),
    kind: 'select',
    label: LABEL,
    multi: false,
    clearable: false,
    items: [],
    current: [],
  };

  const config: t.DevActionSelectConfigArgs<any> = {
    label(value) {
      item.label = format.string(value, { trim: true }) || LABEL;
      return config;
    },
    description(value) {
      item.description = format.string(value, { trim: true });
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
    handler(handler) {
      item.handler = handler;
      return config;
    },
  };

  if (typeof params[0] === 'function') {
    params[0](config);
  } else {
    config.label(params[0]).handler(params[1]);
  }

  return { item, config };
}
