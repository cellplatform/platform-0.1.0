import { format, t } from '../../common';

const UNTITLED = 'Untitled';

/**
 * A [Title] configurator.
 */
export function TitleConfig(params: any[]) {
  const item: t.ActionItemTitle = { type: 'title', text: UNTITLED };

  const config: t.ActionTitleConfigArgs<any> = {
    text(value) {
      item.text = format.string(value, { trim: true }) || UNTITLED;
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
