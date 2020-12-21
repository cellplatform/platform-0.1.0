import { format, t } from '../../common';

/**
 * A [Horizontal Rule] configurator.
 */
export function HrConfig(params: any[]) {
  const item: t.ActionItemHr = { type: 'hr', height: 8 };

  const config: t.ActionHrConfigArgs<any> = {
    height(value) {
      item.height = Math.max(1, value);
      return config;
    },
  };

  if (typeof params[0] === 'function') {
    params[0](config);
  }

  return { item, config };
}
