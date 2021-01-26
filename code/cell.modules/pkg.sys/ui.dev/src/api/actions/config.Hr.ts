import { t, R, slug } from '../../common';

/**
 * A [Horizontal Rule] configurator.
 */
export function HrConfig(params: any[]) {
  const item: t.DevActionHr = {
    id: slug(),
    kind: 'hr',
    height: 8,
    opacity: 0.06,
    margin: [8, 8],
  };

  const config: t.DevActionHrConfigArgs<any> = {
    height(value) {
      item.height = Math.max(0, value);
      return config;
    },
    opacity(value) {
      item.opacity = R.clamp(0, 1)(value);
      return config;
    },
    margin(value) {
      item.margin = value;
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
  if (typeof params[2] === 'number' || Array.isArray(params[2])) {
    config.margin(params[2] as t.DevEdgeSpacing);
  }

  return { item, config };
}
