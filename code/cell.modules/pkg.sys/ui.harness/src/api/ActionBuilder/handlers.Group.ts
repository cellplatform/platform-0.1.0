import { format, t } from '../../common';
import { ButtonConfig } from './handlers.Button';
import { HrConfig } from './handlers.Hr';

/**
 * A Grpup configurator.
 */
export function GroupConfig(params: any[]) {
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
