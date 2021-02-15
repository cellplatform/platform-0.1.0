import { format, t, slug, DEFAULT } from '../common';

type O = Record<string, unknown>;

/**
 * A [Button] configurator.
 */
export function config<Ctx extends O>(ctx: Ctx, params: any[]) {
  const label = DEFAULT.UNNAMED;
  const item: t.ActionButton = { id: slug(), kind: 'dev/button', label, handlers: [] };

  const config: t.ActionButtonConfigArgs<any> = {
    ctx,
    label(value) {
      item.label = format.string(value, { trim: true }) || label;
      return config;
    },
    description(value) {
      item.description = format.string(value, { trim: true });
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
