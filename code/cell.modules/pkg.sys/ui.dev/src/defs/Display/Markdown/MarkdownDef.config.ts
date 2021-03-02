import { DEFAULT, format, slug, t } from '../common';

type O = Record<string, unknown>;

const EMPTY = '<empty>';

/**
 * A [Markdown] configurator.
 */
export function config<Ctx extends O>(ctx: Ctx, params: any[]) {
  const item: t.ActionMarkdown = {
    id: slug(),
    kind: 'display/markdown',
    markdown: EMPTY,
    margin: [5, 15, 5, 8],
  };

  const config: t.ActionMarkdownConfigArgs<any> = {
    ctx,
    text(value) {
      item.markdown = format.string(value, { trim: true }) || EMPTY;
      return config;
    },
    margin(value) {
      item.margin = value;
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
