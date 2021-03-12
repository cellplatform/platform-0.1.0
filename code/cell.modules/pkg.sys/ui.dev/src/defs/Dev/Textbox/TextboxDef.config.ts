import { format, t, slug } from '../common';

type O = Record<string, unknown>;

/**
 * A [Boolean] switch configurator.
 */
export function config<Ctx extends O>(ctx: Ctx, params: any[]) {
  const item: t.ActionTextbox = { id: slug(), kind: 'dev/textbox', handlers: [] };

  const config: t.ActionTextboxConfigArgs<any> = {
    ctx,
    initial(value) {
      item.current = format.string(value, { trim: true });
      return config;
    },
    label(value) {
      item.label = format.string(value, { trim: true });
      return config;
    },
    placeholder(value) {
      item.placeholder = format.string(value, { trim: true });
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
