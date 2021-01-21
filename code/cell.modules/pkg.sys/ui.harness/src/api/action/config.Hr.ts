import { format, t, R } from '../../common';

/**
 * A [Horizontal Rule] configurator.
 */
export function HrConfig(params: any[]) {
  const item: t.ActionItemHr = { type: 'hr', height: 8, opacity: 0.06 };

  const config: t.ActionHrConfigArgs<any> = {
    height(value) {
      item.height = Math.max(0, value);
      return config;
    },
    opacity(value) {
      item.opacity = R.clamp(0, 1)(value);
      return config;
    },
  };

  if (typeof params[0] === 'function') {
    params[0](config);
  }
  if (typeof params[0] === 'number') {
    config.height(params[0]);
  }
  if (typeof params[1] === 'number') {
    config.opacity(params[1]);
  }

  return { item, config };
}
