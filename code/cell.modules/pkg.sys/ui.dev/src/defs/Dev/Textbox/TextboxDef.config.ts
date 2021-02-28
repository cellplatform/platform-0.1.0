import { format, t, slug, DEFAULT } from '../common';

type O = Record<string, unknown>;

/**
 * A [Boolean] switch configurator.
 */
export function config<Ctx extends O>(ctx: Ctx, params: any[]) {
  const placeholder = DEFAULT.UNNAMED;
  const item: t.ActionTextbox = { id: slug(), kind: 'dev/textbox', placeholder, handlers: [] };

  const config: t.ActionTextboxConfigArgs<any> = {
    ctx,
    placeholder(value) {
      item.placeholder = format.string(value, { trim: true }) || placeholder;
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
    config.placeholder(params[0]).pipe(params[1]);
  }

  return { item, config };
}
