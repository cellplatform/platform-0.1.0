import { t } from '../../common';

type O = Record<string, unknown>;

/**
 *  Markdown display text.
 */
export type ActionMarkdown = {
  id: string;
  kind: 'display/markdown';
  markdown: string;
  margin: t.CssEdgesInput;
};

/**
 * CONFIGURE Markdown.
 */
export type ActionMarkdownConfig<Ctx extends O> = (args: ActionMarkdownConfigArgs<Ctx>) => void;
export type ActionMarkdownConfigArgs<Ctx extends O> = {
  ctx: Ctx;
  text(value: string): ActionMarkdownConfigArgs<Ctx>;
  margin(value: t.CssEdgesInput): ActionMarkdownConfigArgs<Ctx>;
};
