import { format, t, slug } from '../../common';

export const Boolean = {
  /**
   * A [Boolean] switch configurator.
   */
  config(params: any[]) {
    const LABEL = 'Unnamed';
    const item: t.DevActionBoolean = { id: slug(), kind: 'boolean', label: LABEL };

    const config: t.DevActionBooleanConfigArgs<any> = {
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
