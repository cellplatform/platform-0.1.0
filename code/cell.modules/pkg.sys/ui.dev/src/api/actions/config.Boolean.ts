import { format, t, slug } from '../../common';

type O = Record<string, unknown>;

export const Boolean = {
  /**
   * A [Boolean] switch configurator.
   */
  config<Ctx extends O>(ctx: Ctx, params: any[]) {
    const LABEL = 'Unnamed';
    const item: t.DevActionBoolean = { id: slug(), kind: 'boolean', label: LABEL };

    const config: t.DevActionBooleanConfigArgs<any> = {
      ctx,
      label(value) {
        item.label = format.string(value, { trim: true }) || LABEL;
        return config;
      },
      description(value) {
        item.description = format.string(value, { trim: true });
        return config;
      },
      handler(handler) {
        item.handler = handler;
        return config;
      },
    };

    if (typeof params[0] === 'function') {
      params[0](config);
    } else {
      config.label(params[0]).handler(params[1]);
    }

    return { item, config };
  },
};
