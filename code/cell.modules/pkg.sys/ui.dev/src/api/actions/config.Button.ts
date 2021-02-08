import { format, t, slug } from '../../common';

type O = Record<string, unknown>;

export const Button = {
  /**
   * A [Button] configurator.
   */
  config<Ctx extends O>(ctx: Ctx, params: any[]) {
    const LABEL = 'Unnamed';
    const item: t.DevActionButton = { id: slug(), kind: 'button', label: LABEL, handlers: [] };

    const config: t.DevActionButtonConfigArgs<any> = {
      ctx,
      label(value) {
        item.label = format.string(value, { trim: true }) || LABEL;
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
  },
};
