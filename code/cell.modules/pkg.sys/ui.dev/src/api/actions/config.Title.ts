import { DEFAULT, format, slug, t } from '../../common';

type O = Record<string, unknown>;

export const Title = {
  /**
   * A [Title] configurator.
   */
  config<Ctx extends O>(ctx: Ctx, params: any[]) {
    const item: t.DevActionTitle = { id: slug(), kind: 'title', text: DEFAULT.UNTITLED };

    const config: t.DevActionTitleConfigArgs<any> = {
      ctx,
      text(value) {
        item.text = format.string(value, { trim: true }) || DEFAULT.UNTITLED;
        return config;
      },
    };

    if (typeof params[0] === 'function') {
      params[0](config);
    }

    if (typeof params[0] === 'string') {
      config.text(params[0]);
      if (typeof params[1] === 'function') {
        params[1](config);
      }
    }

    return { item, config };
  },
};
