import { DEFAULT, format, slug, t } from '../../../common';
import { SelectUtil } from './util';

type O = Record<string, unknown>;

/**
 * A [Select] dropdown configurator.
 */

export function config<Ctx extends O>(ctx: Ctx, params: any[]) {
  const item = SelectUtil.default();

  const config: t.ActionSelectConfigArgs<any> = {
    ctx,
    label(value) {
      item.label = format.string(value, { trim: true }) || DEFAULT.UNNAMED;
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
    initial(value) {
      item.initial = value;
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
