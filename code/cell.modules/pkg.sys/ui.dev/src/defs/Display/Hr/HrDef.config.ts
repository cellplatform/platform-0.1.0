import { t, R, slug } from '../common';

type O = Record<string, unknown>;

const borderStyles: t.ActionHrBorderStyle[] = ['solid', 'dashed'];

/**
 * A [Horizontal Rule] configurator.
 */
export function config<Ctx extends O>(ctx: Ctx, params: any[]) {
  const item: t.ActionHr = {
    id: slug(),
    kind: 'display/hr',
    height: 8,
    opacity: 0.06,
    margin: [8, 8],
    borderStyle: 'solid',
  };

  const config: t.ActionHrConfigArgs<any> = {
    ctx,
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
    borderStyle(value) {
      if (borderStyles.includes(value)) item.borderStyle = value;
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
    config.margin(params[2] as t.EdgeSpacing);
  }
  if (typeof params[3] === 'string') {
    config.borderStyle(params[3] as t.ActionHrBorderStyle);
  }

  return { item, config };
}
