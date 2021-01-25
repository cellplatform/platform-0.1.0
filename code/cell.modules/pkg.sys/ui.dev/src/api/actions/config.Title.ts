import { format, t, DEFAULT, slug } from '../../common';

/**
 * A [Title] configurator.
 */
export function TitleConfig(params: any[]) {
  const item: t.DevActionItemTitle = { id: slug(), kind: 'title', text: DEFAULT.UNTITLED };

  const config: t.DevActionTitleConfigArgs<any> = {
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
}
